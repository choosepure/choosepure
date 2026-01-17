from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timedelta
import logging
import json

# Import email service and razorpay service
from email_service import email_service
from services.razorpay_service import razorpay_service

router = APIRouter()
logger = logging.getLogger(__name__)

class ReportPurchaseRequest(BaseModel):
    firstName: str
    lastName: Optional[str] = None
    email: EmailStr
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    reportType: str = "milk_quality_scorecard"
    amount: float = 199.0

class PaymentResponse(BaseModel):
    success: bool
    orderId: Optional[str] = None
    razorpayOrderId: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    message: str
    deliveryTime: Optional[str] = None

class PaymentVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    customer_order_id: str

# In-memory storage for demo (use database in production)
report_orders = {}

@router.post("/purchase-report", response_model=PaymentResponse)
async def purchase_report(
    request: ReportPurchaseRequest,
    background_tasks: BackgroundTasks
):
    """
    Create Razorpay order for report purchase
    """
    try:
        logger.info(f"Purchase report request received for {request.email}")
        
        # Check if Razorpay service is initialized
        if not razorpay_service.client:
            logger.error("Razorpay service not initialized - missing credentials")
            raise HTTPException(
                status_code=500, 
                detail="Payment service not configured. Please contact support."
            )
        
        # Generate our internal order ID
        order_id = f"CP{uuid.uuid4().hex[:8].upper()}"
        logger.info(f"Generated order ID: {order_id}")
        
        # Calculate delivery time (24 hours from now)
        delivery_time = (datetime.now() + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M")
        
        # Create Razorpay order
        logger.info(f"Creating Razorpay order for amount: ₹{request.amount}")
        razorpay_order = razorpay_service.create_order(
            amount=request.amount,
            currency="INR",
            receipt=order_id,
            notes={
                "customer_name": f"{request.firstName} {request.lastName or ''}".strip(),
                "customer_email": request.email,
                "customer_phone": request.phone,
                "report_type": request.reportType,
                "order_type": "report_purchase"
            }
        )
        
        logger.info(f"Razorpay order response: success={razorpay_order['success']}")
        
        if not razorpay_order["success"]:
            error_msg = razorpay_order.get('error', 'Unknown error')
            logger.error(f"Razorpay order creation failed: {error_msg}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to create payment order: {error_msg}"
            )
        
        # Store order details (in production, save to database)
        order_data = {
            "orderId": order_id,
            "razorpayOrderId": razorpay_order["order_id"],
            "customerInfo": request.dict(),
            "orderDate": datetime.now().isoformat(),
            "deliveryTime": delivery_time,
            "status": "created",
            "amount": request.amount,
            "paymentStatus": "pending"
        }
        report_orders[order_id] = order_data
        
        logger.info(f"Report purchase order created successfully: {order_id} -> {razorpay_order['order_id']}")
        
        return PaymentResponse(
            success=True,
            orderId=order_id,
            razorpayOrderId=razorpay_order["order_id"],
            amount=request.amount,
            currency="INR",
            message="Payment order created successfully",
            deliveryTime=delivery_time
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating report purchase order: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create payment order - please try again")

@router.post("/verify-report-payment")
async def verify_report_payment(
    request: PaymentVerificationRequest,
    background_tasks: BackgroundTasks
):
    """
    Verify Razorpay payment and process report delivery
    """
    try:
        # Verify payment signature
        is_valid = razorpay_service.verify_payment_signature(
            request.razorpay_order_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Get payment details
        payment_details = razorpay_service.get_payment_details(request.razorpay_payment_id)
        
        if not payment_details["success"]:
            raise HTTPException(status_code=400, detail="Failed to fetch payment details")
        
        # Update order status
        if request.customer_order_id in report_orders:
            order_data = report_orders[request.customer_order_id]
            order_data["status"] = "confirmed"
            order_data["paymentStatus"] = "completed"
            order_data["razorpayPaymentId"] = request.razorpay_payment_id
            order_data["paymentDetails"] = payment_details
            order_data["confirmedAt"] = datetime.now().isoformat()
            
            # Send confirmation email
            customer_info = order_data["customerInfo"]
            background_tasks.add_task(
                send_purchase_confirmation_email,
                customer_info["email"],
                customer_info["firstName"],
                request.customer_order_id,
                order_data["deliveryTime"],
                customer_info["amount"]
            )
            
            # Schedule report delivery
            background_tasks.add_task(
                schedule_report_delivery,
                customer_info["email"],
                customer_info["firstName"],
                request.customer_order_id,
                customer_info["reportType"]
            )
            
            logger.info(f"Payment verified and confirmed for order: {request.customer_order_id}")
            
            return {
                "success": True,
                "message": "Payment verified successfully. Report will be delivered within 24 hours.",
                "order_id": request.customer_order_id
            }
        else:
            raise HTTPException(status_code=404, detail="Order not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment verification failed")

@router.get("/order/{order_id}")
async def get_order_status(order_id: str):
    """
    Get order status and details
    """
    if order_id not in report_orders:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return report_orders[order_id]

async def send_purchase_confirmation_email(
    email: str, 
    first_name: str, 
    order_id: str, 
    delivery_time: str,
    amount: float
):
    """
    Send purchase confirmation email
    """
    try:
        subject = f"Order Confirmation - {order_id} | ChoosePure Report"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">ChoosePure</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Food Safety Community</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Thank You for Your Purchase!</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Dear {first_name},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your payment has been successfully processed. Here are your order details:
                </p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Order ID:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">{order_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Report:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">Milk Quality Scorecard Report</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount Paid:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">₹{amount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Delivery:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">Within 24 hours</td>
                        </tr>
                    </table>
                </div>
                
                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
                    <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">What's Next?</h3>
                    <ul style="color: #047857; margin: 0; padding-left: 20px;">
                        <li>Our team will prepare your detailed report</li>
                        <li>You'll receive the full report via email within 24 hours</li>
                        <li>The report includes comprehensive analysis and recommendations</li>
                    </ul>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    If you have any questions, please don't hesitate to contact us at 
                    <a href="mailto:support@choosepure.in" style="color: #10b981;">support@choosepure.in</a>
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for supporting our mission of food safety and transparency!
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
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
                    Visit us at <a href="https://choosepure.in" style="color: #10b981;">choosepure.in</a>
                </p>
            </div>
        </div>
        """
        
        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        logger.info(f"Purchase confirmation email sent to {email}")
        
    except Exception as e:
        logger.error(f"Failed to send purchase confirmation email: {str(e)}")

async def schedule_report_delivery(
    email: str,
    first_name: str, 
    order_id: str,
    report_type: str
):
    """
    Schedule report delivery (in production, use a proper job queue like Celery)
    For demo purposes, we'll send a sample report immediately
    """
    try:
        # In production, this would be scheduled for actual delivery time
        # For demo, we'll send immediately
        await send_report_delivery_email(email, first_name, order_id, report_type)
        
    except Exception as e:
        logger.error(f"Failed to schedule report delivery: {str(e)}")

async def send_report_delivery_email(
    email: str,
    first_name: str,
    order_id: str,
    report_type: str
):
    """
    Send the actual report to customer
    """
    try:
        subject = f"Your Full Report is Ready - {order_id} | ChoosePure"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">ChoosePure</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your Report is Ready!</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Your Full Report is Here!</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Dear {first_name},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your detailed Milk Quality Scorecard Report is now ready! This comprehensive analysis 
                    includes everything you need to make informed decisions about milk brands for your family.
                </p>
                
                <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">📊 Full Report Contents</h3>
                    <ul style="color: #0c4a6e; text-align: left; margin: 0; padding-left: 20px;">
                        <li>Detailed analysis of 15+ milk brands</li>
                        <li>Individual brand scorecards with recommendations</li>
                        <li>Lab test methodologies and certifications</li>
                        <li>Nutritional comparison charts</li>
                        <li>Safety and purity analysis</li>
                        <li>Price vs quality recommendations</li>
                        <li>Best choices for different family needs</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        📥 Download Your Report (PDF)
                    </a>
                </div>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-weight: 500;">
                        💡 Pro Tip: Save this report for future reference when shopping for milk. 
                        Share it with family and friends to help them make better choices too!
                    </p>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    We hope this report helps you choose the best milk for your family's health and safety.
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Have questions about the report? Reply to this email or contact us at 
                    <a href="mailto:support@choosepure.in" style="color: #10b981;">support@choosepure.in</a>
                </p>
                
                <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #065f46; margin: 0 0 10px 0;">Join Our Community!</h3>
                    <p style="color: #047857; margin: 0 0 15px 0;">
                        Get early access to new reports and help us test more food products
                    </p>
                    <a href="https://choosepure.in/#waitlist" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                        Join Waitlist
                    </a>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for supporting transparent food testing!
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    The ChoosePure Team
                </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Order ID: {order_id} | ChoosePure - India's First Parent-Led Food Safety Community
                </p>
            </div>
        </div>
        """
        
        # In production, you would attach the actual PDF report here
        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        logger.info(f"Report delivery email sent to {email} for order {order_id}")
        
    except Exception as e:
        logger.error(f"Failed to send report delivery email: {str(e)}")