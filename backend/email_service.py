import os
import requests
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class MailgunEmailService:
    """Mailgun email service for sending emails"""
    
    def __init__(self):
        self.api_key = os.getenv('MAILGUN_API_KEY')
        self.domain = os.getenv('MAILGUN_DOMAIN')
        self.from_email = os.getenv('MAILGUN_FROM_EMAIL', f'noreply@{self.domain}')
        
        # Check for EU region endpoint
        self.endpoint = os.getenv('MAILGUN_ENDPOINT', 'api.mailgun.net')
        self.base_url = f'https://{self.endpoint}/v3/{self.domain}'
        
        if not self.api_key or not self.domain:
            logger.warning("Mailgun credentials not configured. Email sending will be disabled.")
            logger.warning(f"MAILGUN_API_KEY present: {bool(self.api_key)}")
            logger.warning(f"MAILGUN_DOMAIN present: {bool(self.domain)}")
            self.enabled = False
        else:
            self.enabled = True
            logger.info(f"Mailgun email service initialized for domain: {self.domain}")
            logger.info(f"From email: {self.from_email}")
            logger.info(f"Endpoint: {self.endpoint}")
            logger.info(f"Base URL: {self.base_url}")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None,
        reply_to: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Send an email using Mailgun API
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (optional)
            from_email: Sender email (optional, uses default)
            reply_to: Reply-to email (optional)
            tags: List of tags for tracking (optional)
        
        Returns:
            Dict with success status and message/error details
        """
        if not self.enabled:
            logger.warning(f"Email service disabled. Would send email to {to_email} with subject: {subject}")
            return {
                "success": False,
                "error": "Email service not configured",
                "message": "Mailgun credentials not set"
            }
        
        try:
            # Prepare email data
            data = {
                'from': from_email or self.from_email,
                'to': to_email,
                'subject': subject,
                'html': html_content
            }
            
            if text_content:
                data['text'] = text_content
            
            if reply_to:
                data['h:Reply-To'] = reply_to
            
            if tags:
                for tag in tags:
                    data[f'o:tag'] = tag
            
            logger.info(f"Sending email to {to_email} with subject: {subject}")
            logger.debug(f"Using from email: {data['from']}")
            logger.debug(f"Mailgun URL: {self.base_url}/messages")
            
            # Send email via Mailgun API
            response = requests.post(
                f'{self.base_url}/messages',
                auth=('api', self.api_key),
                data=data,
                timeout=30
            )
            
            logger.info(f"Mailgun API response status: {response.status_code}")
            logger.debug(f"Mailgun API response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Email sent successfully to {to_email}. Message ID: {result.get('id')}")
                return {
                    "success": True,
                    "message_id": result.get('id'),
                    "message": "Email sent successfully"
                }
            else:
                error_msg = f"Mailgun API error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": "API_ERROR",
                    "message": error_msg,
                    "status_code": response.status_code
                }
                
        except requests.exceptions.Timeout:
            error_msg = "Email sending timed out"
            logger.error(error_msg)
            return {
                "success": False,
                "error": "TIMEOUT",
                "message": error_msg
            }
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error sending email: {str(e)}"
            logger.error(error_msg)
            return {
                "success": False,
                "error": "NETWORK_ERROR",
                "message": error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error sending email: {str(e)}"
            logger.error(error_msg)
            return {
                "success": False,
                "error": "UNKNOWN_ERROR",
                "message": error_msg
            }
    
    async def send_password_reset_email(self, to_email: str, reset_token: str, user_name: Optional[str] = None) -> Dict[str, Any]:
        """Send password reset email with OTP"""
        subject = "Password Reset Code - ChoosePure"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                    {"Hello " + user_name + "!" if user_name else "Hello!"}
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    You requested a password reset for your ChoosePure account. Use the code below to reset your password:
                </p>
                
                <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                    <h2 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        {reset_token}
                    </h2>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    This code will expire in 15 minutes for security reasons.
                </p>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                    This email was sent by ChoosePure. If you have any questions, please contact our support team.
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset - ChoosePure
        
        {"Hello " + user_name + "!" if user_name else "Hello!"}
        
        You requested a password reset for your ChoosePure account.
        
        Your reset code is: {reset_token}
        
        This code will expire in 15 minutes for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The ChoosePure Team
        """
        
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            tags=['password-reset', 'transactional']
        )
    
    async def send_welcome_email(self, to_email: str, user_name: str) -> Dict[str, Any]:
        """Send welcome email to new users"""
        subject = "Welcome to ChoosePure!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ChoosePure</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ChoosePure!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Hello {user_name}!
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Welcome to ChoosePure! We're excited to have you join our community of conscious consumers.
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    With ChoosePure, you can:
                </p>
                
                <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
                    <li>Discover ethical and sustainable products</li>
                    <li>Read and write product reviews</li>
                    <li>Stay updated with our newsletter</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Start Exploring
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    If you have any questions, feel free to reach out to our support team.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Thank you for choosing ChoosePure!
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to ChoosePure!
        
        Hello {user_name}!
        
        Welcome to ChoosePure! We're excited to have you join our community of conscious consumers.
        
        With ChoosePure, you can:
        - Discover ethical and sustainable products
        - Read and write product reviews
        - Stay updated with our newsletter
        
        If you have any questions, feel free to reach out to our support team.
        
        Thank you for choosing ChoosePure!
        
        Best regards,
        The ChoosePure Team
        """
        
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            tags=['welcome', 'transactional']
        )
    
    async def send_newsletter_confirmation_email(self, to_email: str) -> Dict[str, Any]:
        """Send newsletter subscription confirmation email"""
        subject = "Newsletter Subscription Confirmed - ChoosePure"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Newsletter Subscription Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Confirmed!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                    Thank you for subscribing to the ChoosePure newsletter!
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                    You'll now receive updates about:
                </p>
                
                <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
                    <li>New ethical and sustainable products</li>
                    <li>Community highlights and discussions</li>
                    <li>Tips for conscious consumption</li>
                    <li>Platform updates and new features</li>
                </ul>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    You can unsubscribe at any time by clicking the unsubscribe link in any newsletter email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Thank you for being part of the ChoosePure community!
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Newsletter Subscription Confirmed - ChoosePure
        
        Thank you for subscribing to the ChoosePure newsletter!
        
        You'll now receive updates about:
        - New ethical and sustainable products
        - Community highlights and discussions
        - Tips for conscious consumption
        - Platform updates and new features
        
        You can unsubscribe at any time by clicking the unsubscribe link in any newsletter email.
        
        Thank you for being part of the ChoosePure community!
        
        Best regards,
        The ChoosePure Team
        """
        
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            tags=['newsletter', 'confirmation']
        )

# Global email service instance
email_service = MailgunEmailService()