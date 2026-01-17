from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
import json
import logging
from datetime import datetime

# Import services
from email_service import email_service
from services.razorpay_service import razorpay_service

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory storage for demo (use database in production)
from routes.report_routes import report_orders
from routes.subscription_payment_routes import subscriptions

class WebhookEvent(BaseModel):
    event: str
    payload: Dict[str, Any]
    created_at: int

@router.post("/razorpay-webhook")
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Handle Razorpay webhook events
    """
    try:
        # Get raw body and signature
        body = await request.body()
        signature = request.headers.get('X-Razorpay-Signature', '')
        
        # Verify webhook signature
        if not razorpay_service.verify_webhook_signature(body.decode('utf-8'), signature):
            logger.warning("Invalid webhook signature received")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse webhook payload
        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            logger.error("Invalid JSON in webhook payload")
            raise HTTPException(status_code=400, detail="Invalid JSON")
        
        event_type = payload.get('event')
        event_data = payload.get('payload', {})
        
        logger.info(f"Received Razorpay webhook: {event_type}")
        
        # Handle different event types
        if event_type == 'payment.captured':
            await handle_payment_captured(event_data, background_tasks)
        elif event_type == 'payment.failed':
            await handle_payment_failed(event_data, background_tasks)
        elif event_type == 'subscription.activated':
            await handle_subscription_activated(event_data, background_tasks)
        elif event_type == 'subscription.charged':
            await handle_subscription_charged(event_data, background_tasks)
        elif event_type == 'subscription.cancelled':
            await handle_subscription_cancelled(event_data, background_tasks)
        elif event_type == 'subscription.completed':
            await handle_subscription_completed(event_data, background_tasks)
        elif event_type == 'order.paid':
            await handle_order_paid(event_data, background_tasks)
        else:
            logger.info(f"Unhandled webhook event: {event_type}")
        
        return {"status": "success", "message": "Webhook processed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def handle_payment_captured(event_data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Handle payment.captured event
    """
    try:
        payment = event_data.get('payment', {}).get('entity', {})
        payment_id = payment.get('id')
        order_id = payment.get('order_id')
        amount = payment.get('amount', 0) / 100  # Convert from paise to rupees
        status = payment.get('status')
        
        logger.info(f"Payment captured: {payment_id} for order: {order_id}")
        
        # Find corresponding order in our system
        customer_order_id = None
        for order_key, order_data in report_orders.items():
            if order_data.get('razorpayOrderId') == order_id:
                customer_order_id = order_key
                break
        
        if customer_order_id:
            # Update order status
            order_data = report_orders[customer_order_id]
            order_data['paymentStatus'] = 'captured'
            order_data['razorpayPaymentId'] = payment_id
            order_data['capturedAt'] = datetime.now().isoformat()
            
            # Send confirmation email if not already sent
            if order_data.get('status') != 'confirmed':
                order_data['status'] = 'confirmed'
                customer_info = order_data['customerInfo']
                
                background_tasks.add_task(
                    send_payment_captured_email,
                    customer_info['email'],
                    customer_info['firstName'],
                    customer_order_id,
                    amount
                )
                
                # Schedule report delivery
                background_tasks.add_task(
                    schedule_report_delivery_webhook,
                    customer_info['email'],
                    customer_info['firstName'],
                    customer_order_id,
                    customer_info['reportType']
                )
        
    except Exception as e:
        logger.error(f"Error handling payment.captured: {str(e)}")

async def handle_payment_failed(event_data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Handle payment.failed event
    """
    try:
        payment = event_data.get('payment', {}).get('entity', {})
        payment_id = payment.get('id')
        order_id = payment.get('order_id')
        error_code = payment.get('error_code')
        error_description = payment.get('error_description')
        
        logger.warning(f"Payment failed: {payment_id} for order: {order_id} - {error_description}")
        
        # Find corresponding order
        customer_order_id = None
        for order_key, order_data in report_orders.items():
            if order_data.get('razorpayOrderId') == order_id:
                customer_order_id = order_key
                break
        
        if customer_order_id:
            # Update order status
            order_data = report_orders[customer_order_id]
            order_data['paymentStatus'] = 'failed'
            order_data['failureReason'] = error_description
            order_data['failedAt'] = datetime.now().isoformat()
            
            # Send failure notification email
            customer_info = order_data['customerInfo']
            background_tasks.add_task(
                send_payment_failed_email,
                customer_info['email'],
                customer_info['firstName'],
                customer_order_id,
                error_description
            )
        
    except Exception as e:
        logger.error(f"Error handling payment.failed: {str(e)}")

async def handle_subscription_activated(event_data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Handle subscription.activated event
    """
    try:
        subscription = event_data.get('subscription', {}).get('entity', {})
        subscription_id = subscription.get('id')
        plan_id = subscription.get('plan_id')
        status = subscription.get('status')
        
        logger.info(f"Subscription activated: {subscription_id}")
        
        # Find corresponding subscription in our system
        customer_subscription_id = None
        for sub_key, sub_data in subscriptions.items():
            if sub_data.get('razorpaySubscriptionId') == subscription_id:
                customer_subscription_id = sub_key
                break
        
        if customer_subscription_id:
            # Update subscription status
            sub_data = subscriptions[customer_subscription_id]
            sub_data['status'] = 'active'
            sub_data['activatedAt'] = datetime.now().isoformat()
            
            # Send activation email if not already sent
            customer_info = sub_data['customerInfo']
            plan_details = sub_data['planDetails']
            
            background_tasks.add_task(
                send_subscription_activated_email,
                customer_info['customer_email'],
                customer_info['customer_name'],
                customer_subscription_id,
                plan_details
            )
        
    except Exception as e:
        logger.error(f"Error handling subscription.activated: {str(e)}")

async def handle_subscription_charged(event_data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Handle subscription.charged event (recurring payments)
    """
    try:
        payment = event_data.get('payment', {}).get('entity', {})
        subscription_id = payment.get('subscription_id')
        amount = payment.get('amount', 0) / 100
        
        logger.info(f"Subscription charged: {subscription_id} - ₹{amount}")
        
        # Find corresponding subscription
        customer_subscription_id = None
        for sub_key, sub_data in subscriptions.items():
            if sub_data.get('razorpaySubscriptionId') == subscription_id:
                customer_subscription_id = sub_key
                break
        
        if customer_subscription_id:
            # Update subscription with latest payment
            sub_data = subscriptions[customer_subscription_id]
            sub_data['lastChargedAt'] = datetime.now().isoformat()
            sub_data['lastChargedAmount'] = amount
            
            # Send payment receipt email
            customer_info = sub_data['customerInfo']
            plan_details = sub_data['planDetails']
            
            background_tasks.add_task(
                send_subscription_charged_email,
                customer_info['customer_email'],
                customer_info['customer_name'],
                customer_subscription_id,
                plan_details,
                amount
            )
        
    except Exception as e:
        logger.error(f"Error handling subscription.charged: {str(e)}")

async def handle_subscription_cancelled(event_data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Handle subscription.cancelled event
    """
    try:
        subscription = event_data.get('subscription', {}).get('entity', {})
        subscription_id = subscription.get('id')
        
        logger.info(f"Subscription cancelled: {subscription_id}")
        
        # Find corresponding subscription
        customer_subscription_id = None
        for sub_key, sub_data in subscriptions.items():
            if sub_data.get('razorpaySubscriptionId') == subscription_id:
                customer_subscription_id = sub_key
                break
        
        if customer_subscription_id:
            # Update subscription status
            sub_data = subscriptions[customer_subscription_id]
            sub_data['status'] = 'cancelled'
            sub_data['cancelledAt'] = datetime.now().isoformat()
            
            # Send cancellation confirmation email
            customer_info = sub_data['customerInfo']
            background_tasks.add_task(
                send_subscription_cancelled_webhook_email,
                customer_info['customer_email'],
                customer_info['customer_name'],
                customer_subscription_id
            )
        
    except Exception as e:
        logger.error(f"Error handling subscription.cancelled: {str(e)}")

async def handle_subscription_completed(event_data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Handle subscription.completed event
    """
    try:
        subscription = event_data.get('subscription', {}).get('entity', {})
        subscription_id = subscription.get('id')
        
        logger.info(f"Subscription completed: {subscription_id}")
        
        # Find corresponding subscription
        customer_subscription_id = None
        for sub_key, sub_data in subscriptions.items():
            if sub_data.get('razorpaySubscriptionId') == subscription_id:
                customer_subscription_id = sub_key
                break
        
        if customer_subscription_id:
            # Update subscription status
            sub_data = subscriptions[customer_subscription_id]
            sub_data['status'] = 'completed'
            sub_data['completedAt'] = datetime.now().isoformat()
        
    except Exception as e:
        logger.error(f"Error handling subscription.completed: {str(e)}")

async def handle_order_paid(event_data: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Handle order.paid event
    """
    try:
        order = event_data.get('order', {}).get('entity', {})
        order_id = order.get('id')
        amount = order.get('amount', 0) / 100
        
        logger.info(f"Order paid: {order_id} - ₹{amount}")
        
        # This is usually handled by payment.captured, but we can add additional logic here if needed
        
    except Exception as e:
        logger.error(f"Error handling order.paid: {str(e)}")

# Email functions for webhook events

async def send_payment_captured_email(
    email: str,
    first_name: str,
    order_id: str,
    amount: float
):
    """
    Send payment captured confirmation email
    """
    try:
        subject = f"Payment Confirmed - {order_id} | ChoosePure"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed!</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">ChoosePure</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">✅ Payment Successfully Processed</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Dear {first_name},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Great news! Your payment has been successfully captured and processed.
                </p>
                
                <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #065f46; margin: 0 0 15px 0;">Payment Details</h3>
                    <p style="color: #047857; margin: 0;"><strong>Order ID:</strong> {order_id}</p>
                    <p style="color: #047857; margin: 5px 0 0 0;"><strong>Amount:</strong> ₹{amount}</p>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your report is being prepared and will be delivered to your email within 24 hours.
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for choosing ChoosePure!
                </p>
            </div>
        </div>
        """
        
        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        logger.info(f"Payment captured email sent to {email}")
        
    except Exception as e:
        logger.error(f"Failed to send payment captured email: {str(e)}")

async def send_payment_failed_email(
    email: str,
    first_name: str,
    order_id: str,
    error_description: str
):
    """
    Send payment failed notification email
    """
    try:
        subject = f"Payment Failed - {order_id} | ChoosePure"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Payment Failed</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">ChoosePure</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">❌ Payment Could Not Be Processed</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Dear {first_name},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Unfortunately, your payment could not be processed due to the following reason:
                </p>
                
                <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="color: #991b1b; margin: 0;"><strong>Error:</strong> {error_description}</p>
                    <p style="color: #991b1b; margin: 5px 0 0 0;"><strong>Order ID:</strong> {order_id}</p>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Please try again or contact your bank if the issue persists. You can retry your purchase anytime.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://choosepure.in/samplereport" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        Try Again
                    </a>
                </div>
            </div>
        </div>
        """
        
        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        logger.info(f"Payment failed email sent to {email}")
        
    except Exception as e:
        logger.error(f"Failed to send payment failed email: {str(e)}")

async def send_subscription_activated_email(
    email: str,
    customer_name: str,
    subscription_id: str,
    plan_details: dict
):
    """
    Send subscription activated email via webhook
    """
    try:
        # This would be similar to the welcome email but triggered by webhook
        logger.info(f"Subscription activated via webhook for {email}")
        
    except Exception as e:
        logger.error(f"Failed to send subscription activated email: {str(e)}")

async def send_subscription_charged_email(
    email: str,
    customer_name: str,
    subscription_id: str,
    plan_details: dict,
    amount: float
):
    """
    Send subscription charged (recurring payment) email
    """
    try:
        subject = f"Subscription Renewed - {subscription_id} | ChoosePure"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Renewed!</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">ChoosePure</p>
            </div>
            
            <div style="padding: 30px; background: white;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">🔄 Your Subscription Has Been Renewed</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Dear {customer_name},
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your ChoosePure subscription has been automatically renewed. Thank you for continuing with us!
                </p>
                
                <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">Renewal Details</h3>
                    <p style="color: #0c4a6e; margin: 0;"><strong>Plan:</strong> {plan_details.get('name', 'N/A')}</p>
                    <p style="color: #0c4a6e; margin: 5px 0 0 0;"><strong>Amount Charged:</strong> ₹{amount}</p>
                    <p style="color: #0c4a6e; margin: 5px 0 0 0;"><strong>Subscription ID:</strong> {subscription_id}</p>
                </div>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your subscription benefits continue uninterrupted. Enjoy access to all premium features!
                </p>
            </div>
        </div>
        """
        
        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content
        )
        
        logger.info(f"Subscription charged email sent to {email}")
        
    except Exception as e:
        logger.error(f"Failed to send subscription charged email: {str(e)}")

async def send_subscription_cancelled_webhook_email(
    email: str,
    customer_name: str,
    subscription_id: str
):
    """
    Send subscription cancelled email via webhook
    """
    try:
        # Similar to manual cancellation email but triggered by webhook
        logger.info(f"Subscription cancelled via webhook for {email}")
        
    except Exception as e:
        logger.error(f"Failed to send subscription cancelled email: {str(e)}")

async def schedule_report_delivery_webhook(
    email: str,
    first_name: str,
    order_id: str,
    report_type: str
):
    """
    Schedule report delivery triggered by webhook
    """
    try:
        # Import the function from report_routes
        from routes.report_routes import send_report_delivery_email
        await send_report_delivery_email(email, first_name, order_id, report_type)
        
    except Exception as e:
        logger.error(f"Failed to schedule report delivery via webhook: {str(e)}")

@router.get("/webhook-test")
async def webhook_test():
    """
    Test endpoint to verify webhook setup
    """
    return {
        "status": "success",
        "message": "Webhook endpoint is working",
        "timestamp": datetime.now().isoformat()
    }