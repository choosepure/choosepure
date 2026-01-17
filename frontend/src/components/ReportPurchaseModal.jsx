import React, { useState } from 'react';
import { X, CreditCard, Mail, Phone, User, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from '../hooks/use-toast';
import { reportPurchaseAPI } from '../services/api';

const ReportPurchaseModal = ({ onClose, reportTitle = "Milk Quality Scorecard Report" }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const purchaseData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        reportType: "milk_quality_scorecard",
        amount: 199.0
      };

      const response = await reportPurchaseAPI.purchaseReport(purchaseData);
      
      if (response.data.success) {
        // Initialize Razorpay payment
        const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
        
        const options = {
          key: razorpayKeyId,
          amount: response.data.amount * 100, // Amount in paise
          currency: response.data.currency,
          name: 'ChoosePure',
          description: 'Milk Quality Scorecard Report',
          order_id: response.data.razorpayOrderId,
          handler: async function (razorpayResponse) {
            try {
              // Verify payment on backend
              const verificationResponse = await reportPurchaseAPI.verifyReportPayment({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                customer_order_id: response.data.orderId
              });
              
              if (verificationResponse.data.success) {
                setOrderId(response.data.orderId);
                setStep(3);
                
                toast({
                  title: "Payment Successful!",
                  description: "Your full report will be sent to your email within 24 hours.",
                });
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (verifyError) {
              console.error('Payment verification error:', verifyError);
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support with your payment details.",
                variant: "destructive"
              });
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName || ''}`.trim(),
            email: formData.email,
            contact: formData.phone
          },
          notes: {
            address: formData.address || '',
            city: formData.city || '',
            pincode: formData.pincode || ''
          },
          theme: {
            color: '#10b981'
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              toast({
                title: "Payment Cancelled",
                description: "You can try again anytime.",
                variant: "destructive"
              });
            }
          }
        };

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const rzp = new window.Razorpay(options);
            rzp.open();
          };
          script.onerror = () => {
            setIsProcessing(false);
            toast({
              title: "Payment Gateway Error",
              description: "Unable to load payment gateway. Please try again.",
              variant: "destructive"
            });
          };
          document.body.appendChild(script);
        } else {
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } else {
        throw new Error(response.data.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description: error.response?.data?.detail || error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Full Report</h2>
        <p className="text-gray-600">Get the complete detailed analysis for just ₹199</p>
      </div>

      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Report will be sent to this email</p>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">What you'll get:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-center">
              <CheckCircle2 size={16} className="text-green-600 mr-2" />
              Complete detailed analysis of all milk brands
            </li>
            <li className="flex items-center">
              <CheckCircle2 size={16} className="text-green-600 mr-2" />
              Individual brand scorecards with recommendations
            </li>
            <li className="flex items-center">
              <CheckCircle2 size={16} className="text-green-600 mr-2" />
              Lab test methodologies and certifications
            </li>
            <li className="flex items-center">
              <CheckCircle2 size={16} className="text-green-600 mr-2" />
              Nutritional comparison charts
            </li>
            <li className="flex items-center">
              <CheckCircle2 size={16} className="text-green-600 mr-2" />
              Safety and purity analysis
            </li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-600">Secure payment powered by Razorpay</p>
      </div>

      <Card className="p-4 mb-6 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-900">{reportTitle}</p>
            <p className="text-sm text-gray-600">Full detailed report</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">₹199</p>
            <p className="text-xs text-gray-500">Inclusive of all taxes</p>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center mb-2">
            <Mail className="text-blue-600 mr-2" size={18} />
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="text-blue-600 mr-2" size={18} />
            <span className="font-medium">{formData.phone}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <CreditCard className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-600 mb-2">Secure Payment Gateway</p>
            <p className="text-sm text-gray-500">
              Payment will be processed through Razorpay<br />
              We accept UPI, Cards, Net Banking & Wallets
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <Shield className="text-green-600 mr-2" size={20} />
        <span className="text-sm text-gray-600">256-bit SSL encrypted payment</span>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay ₹199`
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Thank you for your purchase</p>
      </div>

      <Card className="p-6 mb-6 bg-green-50 border-green-200">
        <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3">1</div>
            <span>Payment confirmation sent to {formData.email}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3">2</div>
            <span>Full report will be prepared by our team</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3">3</div>
            <span>Detailed report delivered within 24 hours</span>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Order ID: #{orderId || `CP${Date.now().toString().slice(-6)}`}</p>
        <p className="text-sm text-gray-600">Amount Paid: ₹199</p>
      </div>

      <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
        Close
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            </div>
            <span className="text-sm text-gray-600">
              Step {step} of 3
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default ReportPurchaseModal;