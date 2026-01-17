import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Star, Users, Shield, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from '../hooks/use-toast';
import { subscriptionPaymentAPI } from '../services/api';

const SubscriptionModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: Plans, 2: Details, 3: Payment, 4: Success
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: ''
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await subscriptionPaymentAPI.getPlans();
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setStep(3);
  };

  const handleSubscription = async () => {
    setIsProcessing(true);
    
    try {
      const subscriptionData = {
        plan_id: selectedPlan.id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address
      };

      const response = await subscriptionPaymentAPI.createSubscription(subscriptionData);
      
      if (response.data.success) {
        // Initialize Razorpay subscription payment
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id_here',
          subscription_id: response.data.razorpay_subscription_id,
          name: 'ChoosePure',
          description: `${selectedPlan.name} Subscription`,
          handler: async function (razorpayResponse) {
            try {
              // Verify subscription payment on backend
              const verificationResponse = await subscriptionPaymentAPI.verifySubscriptionPayment({
                razorpay_subscription_id: razorpayResponse.razorpay_subscription_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                customer_subscription_id: response.data.subscription_id
              });
              
              if (verificationResponse.data.success) {
                setSubscriptionId(response.data.subscription_id);
                setStep(4);
                
                toast({
                  title: "Subscription Activated!",
                  description: "Welcome to ChoosePure! Your subscription is now active.",
                });
              } else {
                throw new Error('Subscription verification failed');
              }
            } catch (verifyError) {
              console.error('Subscription verification error:', verifyError);
              toast({
                title: "Subscription Verification Failed",
                description: "Please contact support with your payment details.",
                variant: "destructive"
              });
            }
          },
          prefill: {
            name: formData.customer_name,
            email: formData.customer_email,
            contact: formData.customer_phone
          },
          theme: {
            color: '#10b981'
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              toast({
                title: "Subscription Cancelled",
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
        throw new Error(response.data.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setIsProcessing(false);
      toast({
        title: "Subscription Failed",
        description: error.response?.data?.detail || "There was an error creating your subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPlanIcon = (planId) => {
    if (planId.includes('basic')) return <Users className="text-blue-600" size={24} />;
    if (planId.includes('premium')) return <Star className="text-purple-600" size={24} />;
    return <Shield className="text-green-600" size={24} />;
  };

  const renderStep1 = () => (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Join the ChoosePure community with a subscription that fits your needs</p>
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
              plan.popular ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-green-500'
            }`}
            onClick={() => handlePlanSelect(plan)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getPlanIcon(plan.id)}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
              </div>
              {plan.popular && (
                <Badge className="bg-purple-600">
                  <Star size={12} className="mr-1" />
                  Popular
                </Badge>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">₹{plan.amount}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
              {plan.interval === 'yearly' && (
                <p className="text-sm text-green-600 font-medium">Save 17% with yearly billing</p>
              )}
            </div>

            <ul className="space-y-2 mb-4">
              {plan.features.slice(0, 4).map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm text-gray-700">
                  <Check size={16} className="text-green-600 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
              {plan.features.length > 4 && (
                <li className="text-sm text-gray-500">
                  +{plan.features.length - 4} more features
                </li>
              )}
            </ul>

            <Button 
              className={`w-full ${
                plan.popular 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Choose {plan.name}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Details</h2>
        <p className="text-gray-600">Please provide your information for the subscription</p>
      </div>

      <Card className="p-4 mb-6 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-900">{selectedPlan?.name}</p>
            <p className="text-sm text-gray-600">{selectedPlan?.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">₹{selectedPlan?.amount}</p>
            <p className="text-xs text-gray-500">per {selectedPlan?.interval}</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <div>
          <Label htmlFor="customer_name">Full Name *</Label>
          <Input
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customer_email">Email Address *</Label>
          <Input
            id="customer_email"
            name="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customer_phone">Phone Number *</Label>
          <Input
            id="customer_phone"
            name="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customer_address">Address</Label>
          <Input
            id="customer_address"
            name="customer_address"
            value={formData.customer_address}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
            Back to Plans
          </Button>
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Subscription</h2>
        <p className="text-gray-600">Review your subscription details and complete payment</p>
      </div>

      <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="font-bold text-gray-900 mb-4">Subscription Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold">{selectedPlan?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing:</span>
            <span className="font-semibold">₹{selectedPlan?.amount} / {selectedPlan?.interval}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-semibold">{formData.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold">{formData.customer_email}</span>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <CreditCard className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-600 mb-2">Secure Recurring Payment</p>
            <p className="text-sm text-gray-500">
              Powered by Razorpay<br />
              Your card will be charged automatically each {selectedPlan?.interval}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <Shield className="text-green-600 mr-2" size={20} />
        <span className="text-sm text-gray-600">256-bit SSL encrypted payment</span>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleSubscription} 
          disabled={isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Subscribe for ₹${selectedPlan?.amount}/${selectedPlan?.interval}`
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChoosePure!</h2>
        <p className="text-gray-600">Your subscription is now active</p>
      </div>

      <Card className="p-6 mb-6 bg-green-50 border-green-200">
        <h3 className="font-semibold text-gray-900 mb-4">🎉 Subscription Activated</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center justify-center">
            <Zap className="text-green-600 mr-2" size={16} />
            <span>Instant access to all {selectedPlan?.name} features</span>
          </div>
          <div className="flex items-center justify-center">
            <Users className="text-green-600 mr-2" size={16} />
            <span>Welcome email sent to {formData.customer_email}</span>
          </div>
          <div className="flex items-center justify-center">
            <Shield className="text-green-600 mr-2" size={16} />
            <span>Automatic billing every {selectedPlan?.interval}</span>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Subscription ID: {subscriptionId}</p>
        <p className="text-sm text-gray-600">Plan: {selectedPlan?.name}</p>
      </div>

      <div className="space-y-3">
        <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${step >= 4 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            </div>
            <span className="text-sm text-gray-600">
              Step {step} of 4
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
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;