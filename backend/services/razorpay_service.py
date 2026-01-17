import razorpay
import os
import logging
from typing import Dict, Any, Optional
import hmac
import hashlib

logger = logging.getLogger(__name__)

class RazorpayService:
    def __init__(self):
        self.key_id = os.getenv('RAZORPAY_KEY_ID')
        self.key_secret = os.getenv('RAZORPAY_KEY_SECRET')
        self.webhook_secret = os.getenv('RAZORPAY_WEBHOOK_SECRET')
        
        if not self.key_id or not self.key_secret:
            logger.warning("Razorpay credentials not found in environment variables")
            self.client = None
        else:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
            logger.info("Razorpay client initialized successfully")

    def create_order(self, amount: float, currency: str = "INR", receipt: str = None, notes: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a Razorpay order
        
        Args:
            amount: Amount in rupees (will be converted to paise)
            currency: Currency code (default: INR)
            receipt: Receipt ID for reference
            notes: Additional notes/metadata
            
        Returns:
            Dict containing order details
        """
        if not self.client:
            raise Exception("Razorpay client not initialized")
        
        try:
            # Convert amount to paise (Razorpay expects amount in smallest currency unit)
            amount_in_paise = int(amount * 100)
            
            order_data = {
                "amount": amount_in_paise,
                "currency": currency,
                "receipt": receipt or f"rcpt_{int(amount)}_{currency}",
                "notes": notes or {}
            }
            
            order = self.client.order.create(data=order_data)
            logger.info(f"Razorpay order created: {order['id']}")
            
            return {
                "success": True,
                "order_id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "receipt": order["receipt"],
                "status": order["status"],
                "created_at": order["created_at"]
            }
            
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verify Razorpay payment signature
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            Boolean indicating if signature is valid
        """
        if not self.client:
            logger.error("Razorpay client not initialized")
            return False
        
        try:
            # Create the signature verification payload
            generated_signature = hmac.new(
                self.key_secret.encode('utf-8'),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            is_valid = hmac.compare_digest(generated_signature, razorpay_signature)
            
            if is_valid:
                logger.info(f"Payment signature verified for order: {razorpay_order_id}")
            else:
                logger.warning(f"Invalid payment signature for order: {razorpay_order_id}")
                
            return is_valid
            
        except Exception as e:
            logger.error(f"Error verifying payment signature: {str(e)}")
            return False

    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """
        Get payment details from Razorpay
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            Dict containing payment details
        """
        if not self.client:
            raise Exception("Razorpay client not initialized")
        
        try:
            payment = self.client.payment.fetch(payment_id)
            logger.info(f"Payment details fetched for: {payment_id}")
            
            return {
                "success": True,
                "payment_id": payment["id"],
                "order_id": payment["order_id"],
                "amount": payment["amount"],
                "currency": payment["currency"],
                "status": payment["status"],
                "method": payment["method"],
                "email": payment.get("email"),
                "contact": payment.get("contact"),
                "created_at": payment["created_at"],
                "captured": payment["captured"]
            }
            
        except Exception as e:
            logger.error(f"Error fetching payment details: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def create_subscription_plan(self, plan_id: str, name: str, amount: float, interval: str = "monthly", interval_count: int = 1) -> Dict[str, Any]:
        """
        Create a subscription plan
        
        Args:
            plan_id: Unique plan identifier
            name: Plan name
            amount: Amount in rupees
            interval: Billing interval (monthly, yearly)
            interval_count: Number of intervals
            
        Returns:
            Dict containing plan details
        """
        if not self.client:
            raise Exception("Razorpay client not initialized")
        
        try:
            # Convert amount to paise
            amount_in_paise = int(amount * 100)
            
            plan_data = {
                "period": interval,
                "interval": interval_count,
                "item": {
                    "name": name,
                    "amount": amount_in_paise,
                    "currency": "INR"
                }
            }
            
            plan = self.client.plan.create(data=plan_data)
            logger.info(f"Subscription plan created: {plan['id']}")
            
            return {
                "success": True,
                "plan_id": plan["id"],
                "name": plan["item"]["name"],
                "amount": plan["item"]["amount"],
                "currency": plan["item"]["currency"],
                "period": plan["period"],
                "interval": plan["interval"],
                "created_at": plan["created_at"]
            }
            
        except Exception as e:
            logger.error(f"Error creating subscription plan: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def create_subscription(self, plan_id: str, customer_email: str, customer_contact: str, total_count: int = None, notes: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a subscription
        
        Args:
            plan_id: Razorpay plan ID
            customer_email: Customer email
            customer_contact: Customer phone number
            total_count: Total number of billing cycles
            notes: Additional notes
            
        Returns:
            Dict containing subscription details
        """
        if not self.client:
            raise Exception("Razorpay client not initialized")
        
        try:
            subscription_data = {
                "plan_id": plan_id,
                "customer_notify": 1,
                "notes": notes or {}
            }
            
            if total_count:
                subscription_data["total_count"] = total_count
            
            subscription = self.client.subscription.create(data=subscription_data)
            logger.info(f"Subscription created: {subscription['id']}")
            
            return {
                "success": True,
                "subscription_id": subscription["id"],
                "plan_id": subscription["plan_id"],
                "status": subscription["status"],
                "current_start": subscription.get("current_start"),
                "current_end": subscription.get("current_end"),
                "created_at": subscription["created_at"],
                "short_url": subscription.get("short_url")
            }
            
        except Exception as e:
            logger.error(f"Error creating subscription: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """
        Verify webhook signature from Razorpay
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            
        Returns:
            Boolean indicating if signature is valid
        """
        if not self.webhook_secret:
            logger.error("Webhook secret not configured")
            return False
        
        try:
            generated_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            is_valid = hmac.compare_digest(generated_signature, signature)
            
            if is_valid:
                logger.info("Webhook signature verified successfully")
            else:
                logger.warning("Invalid webhook signature")
                
            return is_valid
            
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return False

# Create a global instance
razorpay_service = RazorpayService()