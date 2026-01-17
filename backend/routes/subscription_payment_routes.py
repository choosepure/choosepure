from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timedelta
import logging
import json

# Import services
from email_service import email_service
from services.razorpay_service import razorpay_service

router = APIRouter()
logger = logging.getLogger(__name__)

class SubscriptionPlan(BaseModel):
    id: str
    name: str
    description: str
    amount: float
    interval: str  # monthly, yearly
    interval_count: int = 1
    features: List[str]
    popular: bool = False

class SubscriptionRequest(BaseModel):
    plan_id: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    customer_address: Optional[str] = None

class SubscriptionResponse(BaseModel):
    success: bool
    subscription_id: Optional[str] = None
    razorpay_subscription_id: Optional[str] = None
    plan_details: Optional[dict] = None
    payment_url: Optional[str] = None
    message: str

class SubscriptionVerificationRequest(BaseModel):
    razorpay_subscription_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    customer_subscription_id: str

# Predefined subscription plans
SUBSCRIPTION_PLANS = {
    "basic_monthly": SubscriptionPlan(
        id="basic_monthly",
        name="Basic Monthly",
        description="Monthly access to all reports and community features",
        amount=199.0,
        interval="monthly",
        interval_count=1,
        features=[
            "Access to all test reports",
            "Monthly new product testing",
            "Community voting rights",
            "Email notifications",
            "Basic customer support"
        ]
    ),
    "premium_monthly": SubscriptionPlan(
        id="premium_monthly",
        name="Premium Monthly",
        description="Premium monthly plan with additional benefits",
        amount=399.0,
        interval="monthly",
        interval_count=1,
        features=[
            "All Basic features",
            "Priority access to new reports",
            "Detailed nutritional analysis",
            "Custom product testing requests",
            "Priority customer support",
            "Exclusive webinars and content"
        ],
        popular=True
    ),
    "basic_yearly": SubscriptionPlan(
        id="basic_yearly",
        name="Basic Yearly",
        description="Yearly access with 2 months free",
        amount=1990.0,  # 10 months price for 12 months
        interval="yearly",
        interval_count=1,
        features=[
            "All Basic Monthly features",
            "2 months free (save 17%)",
            "Annual summary report",
            "Year-end insights"
        ]
    ),
    "premium_yearly": SubscriptionPlan(
        id="premium_yearly",
        name="Premium Yearly",
        description="Premium yearly plan with maximum savings",
        amount=3990.0,  # 10 months price for 12 months
        interval="yearly",
        interval_count=1,
        features=[
            "All Premium Monthly features",
            "2 months free (save 17%)",
            "Annual comprehensive health report",
            "One-on-one nutrition consultation",
            "Custom family meal planning"
        ]
    )
}

# In-memory storage for demo (use database in production)
subscriptions = {}
razorpay_plans = {}

@router.get("/subscription-plans")
async def get_subscription_plans():
    """
    Get all available subscription plans
    """
    return {
        "success": True,
        "plans": list(SUBSCRIPTION_PLANS.values())
    }

@router.get("/subscription-plans/{plan_id}")
async def get_subscription_plan(plan_id: str):
    """
    Get specific subscription plan details
    """
    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {
        "success": True,
        "plan": SUBSCRIPTION_PLANS[plan_id]
    }

@router.post("/create-subscription", response_model=SubscriptionResponse)
async def create_subscription(
    request: SubscriptionRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a new subscription with Razorpay
    """
    try:
        # Validate plan
        if request.plan_id not in SUBSCRIPTION_PLANS:
            raise HTTPException(status_code=400, detail="Invalid plan ID")
        
        plan_details = SUBSCRIPTION_PLANS[request.plan_id]
        
        # Create or get Razorpay plan
        razorpay_plan_id = f"plan_{request.plan_id}"
        
        if razorpay_plan_id not in razorpay_plans:
            # Create plan in Razorpay
            razorpay_plan = razorpay_service.create_subscription_plan(
                plan_id=razorpay_plan_id,
                name=plan_details.name,
                amount=plan_details.amount,
                interval=plan_details.interval,
                interval_count=plan_details.interval_count
            )
            
            if not razorpay_plan["success"]:
                raise HTTPException(status_code=500, detail=f"Failed to create subscription plan: {razorpay_plan.get('error')}")
            
            razorpay_plans[razorpay_plan_id] = razorpay_plan
        else:
            razorpay_plan = razorpay_plans[razorpay_plan_id]
        
        # Generate our internal subscription ID
        subscription_id = f"SUB{uuid.uuid4().hex[:8].upper()}"
        
        # Create subscription in Razorpay
        razorpay_subscription = razorpay_service.create_subscription(
            plan_id=razorpay_plan["plan_id"],
            customer_email=request.customer_email,
            customer_contact=request.customer_phone,
            notes={
                "customer_name": request.customer_name,
                "customer_email": request.customer_email,
                "customer_phone": request.customer_phone,
                "plan_name": plan_details.name,
                "subscription_type": "choosepure_membership"
            }
        )
        
        if not razorpay_subscription["success"]:
            raise HTTPException(status_code=500, detail=f"Failed to create subscription: {razorpay_subscription.get('error')}")
        
        # Store subscription details
        subscription_data = {
            "subscriptionId": subscription_id,
            "razorpaySubscriptionId": razorpay_subscription["subscription_id"],
            "planId": request.plan_id,
            "planDetails": plan_details.dict(),
            "customerInfo": request.dict(),
            "createdAt": datetime.now().isoformat(),
            "status": "created",
            "paymentStatus": "pending"
        }
        subscriptions[subscription_id] = subscription_data
        
        logger.info(f"Subscription created: {subscription_id} -> {razorpay_subscription['subscription_id']}")
        
        return SubscriptionResponse(
            success=True,
            subscription_id=subscription_id,
            razorpay_subscription_id=razorpay_subscription["subscription_id"],
            plan_details=plan_details.dict(),
            payment_url=razorpay_subscription.get("short_url"),
            message="Subscription created successfully"
        )
        
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create subscription")

@router.post("/verify-subscription-payment")
async def verify_subscription_payment(
    request: SubscriptionVerificationRequest,
    background_tasks: BackgroundTasks
):
    """
    Verify subscription payment and activate subscription
    """
    try:
        # Verify payment signature
        is_valid = razorpay_service.verify_payment_signature(
            request.razorpay_subscription_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Get payment details
        payment_details = razorpay_service.get_payment_details(request.razorpay_payment_id)
        
        if not payment_details["success"]:
            raise HTTPException(status_code=400, detail="Failed to fetch payment details")
        
        # Update subscription status
        if request.customer_subscription_id in subscriptions:
            subscription_data = subscriptions[request.customer_subscription_id]
            subscription_data["status"] = "active"
            subscription_data["paymentStatus"] = "completed"
            subscription_data["razorpayPaymentId"] = request.razorpay_payment_id
            subscription_data["paymentDetails"] = payment_details
            subscription_data["activatedAt"] = datetime.now().isoformat()
            
            # Calculate next billing date
            plan_details = subscription_data["planDetails"]
            if plan_details["interval"] == "monthly":
                next_billing = datetime.now() + timedelta(days=30)
            else:  # yearly
                next_billing = datetime.now() + timedelta(days=365)
            
            subscription_data["nextBillingDate"] = next_billing.isoformat()
            
            # Send welcome email
            customer_info = subscription_data["customerInfo"]
            background_tasks.add_task(
                send_subscription_welcome_email,
                customer_info["customer_email"],
                customer_info["customer_name"],
                request.customer_subscription_id,
                plan_details,
                next_billing.strftime("%Y-%m-%d")
            )
            
            logger.info(f"Subscription activated: {request.customer_subscription_id}")
            
            return {
                "success": True,
                "message": "Subscription activated successfully",
                "subscription_id": request.customer_subscription_id,
                "next_billing_date": next_billing.strftime("%Y-%m-%d")
            }
        else:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying subscription payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Subscription verification failed")

@router.get("/subscription/{subscription_id}")
async def get_subscription_status(subscription_id: str):
    """
    Get subscription status and details
    """
    if subscription_id not in subscriptions:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return {
        "success": True,
        "subscription": subscriptions[subscription_id]
    }

@router.post("/cancel-subscription/{subscription_id}")
async def cancel_subscription(subscription_id: str, background_tasks: BackgroundTasks):
    """
    Cancel a subscription
    """
    if subscription_id not in subscriptions:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    try:
        subscription_data = subscriptions[subscription_id]
        
        # Cancel in Razorpay (if needed)
        # razorpay_service.cancel_subscription(subscription_data["razorpaySubscriptionId"])
        
        # Update status
        subscription_data["status"] = "cancelled"
        subscription_data["cancelledAt"] = datetime.now().isoformat()
        
        # Send cancellation email
        customer_info = subscription_data["customerInfo"]
        background_tasks.add_task(
            send_subscription_cancellation_email,
            customer_info["customer_email"],
            customer_info["customer_name"],
            subscription_id
        )
        
        logger.info(f"Subscription cancelled: {subscription_id}")
        
        return {
            "success": True,
            "message": "Subscription cancelled successfully"
        }
        
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

async def send_subscription_welcome_email(
    email: str,
    customer_name: str,
    subscription_id: str,
    plan_details: dict,
    next_billing_date: str
):
    """
    Send subscription welcome email
    """
    try:
        subject = f"Welcome to ChoosePure {plan_details['name']} - {subscription_id}"
        
        features_html = "".join([f"<li>{feature}</li>" for feature in plan_details['features']])
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ChoosePure!</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">{plan_details['name']} Subscription</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">🎉 Your Subscription is Active!</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Dear {customer_name},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Welcome to the ChoosePure community! Your {plan_details['name']} subscription is now active 
                    and you have full access to all the benefits.
                </p>
                
                <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">📋 Your Plan Benefits</h3>
                    <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                        {features_html}
                    </ul>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Subscription ID:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">{subscription_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Plan:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">{plan_details['name']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">₹{plan_details['amount']}/{plan_details['interval']}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Next Billing:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">{next_billing_date}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://choosepure.in/dashboard" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        🚀 Access Your Dashboard
                    </a>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    You can manage your subscription, view reports, and participate in community voting 
                    from your dashboard.
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    If you have any questions, please contact us at 
                    <a href="mailto:support@choosepure.in" style="color: #10b981;">support@choosepure.in</a>
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for joining our mission for food safety and transparency!
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    The ChoosePure Team
                </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    ChoosePure - India's First Parent-Led Food Safety Community
                </p>
            </div>
        </div>
        """
        
        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        logger.info(f"Subscription welcome email sent to {email}")
        
    except Exception as e:
        logger.error(f"Failed to send subscription welcome email: {str(e)}")

async def send_subscription_cancellation_email(
    email: str,
    customer_name: str,
    subscription_id: str
):
    """
    Send subscription cancellation email
    """
    try:
        subject = f"Subscription Cancelled - {subscription_id} | ChoosePure"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f59e0b; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">ChoosePure</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Subscription Cancelled</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">We're Sorry to See You Go</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Dear {customer_name},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your ChoosePure subscription has been successfully cancelled. You will continue to have 
                    access to your current benefits until the end of your current billing period.
                </p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-weight: 500;">
                        📅 Your access will continue until your next billing date. After that, 
                        your subscription will be deactivated.
                    </p>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    We'd love to have you back anytime! You can reactivate your subscription 
                    or choose a different plan from our website.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://choosepure.in/pricing" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        🔄 Reactivate Subscription
                    </a>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    If you cancelled by mistake or have any questions, please contact us at 
                    <a href="mailto:support@choosepure.in" style="color: #10b981;">support@choosepure.in</a>
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for being part of our food safety mission!
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    The ChoosePure Team
                </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Subscription ID: {subscription_id} | ChoosePure
                </p>
            </div>
        </div>
        """
        
        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        logger.info(f"Subscription cancellation email sent to {email}")
        
    except Exception as e:
        logger.error(f"Failed to send subscription cancellation email: {str(e)}")