import React, { useState, useEffect } from 'react';
import { Check, Loader2, CreditCard } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { subscriptionAPI, subscriptionPaymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../components/SubscriptionModal';

const Pricing = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    loadTiers();
    if (isAuthenticated && user) {
      loadUserSubscription();
    }
  }, [isAuthenticated, user]);

  const loadTiers = async () => {
    try {
      // Load both old and new subscription plans
      const [oldTiersResponse, newPlansResponse] = await Promise.all([
        subscriptionAPI.getTiers().catch(() => ({ data: { tiers: [] } })),
        subscriptionPaymentAPI.getPlans().catch(() => ({ data: { plans: [] } }))
      ]);
      
      // Combine old tiers and new plans
      const oldTiers = oldTiersResponse.data.tiers || [];
      const newPlans = newPlansResponse.data.plans || [];
      
      // Convert new plans to tier format for compatibility
      const convertedPlans = newPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.amount,
        duration_days: plan.interval === 'yearly' ? 365 : 30,
        features: plan.features,
        popular: plan.popular,
        isNewPlan: true
      }));
      
      setTiers([...oldTiers, ...convertedPlans]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscription = async () => {
    try {
      const response = await subscriptionAPI.getUserStatus(user.id);
      if (response.data.is_subscribed) {
        setUserSubscription(response.data);
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const handleSubscribe = async (tier) => {
    // Use new subscription modal for new plans
    if (tier.isNewPlan) {
      setShowSubscriptionModal(true);
      return;
    }

    // Legacy subscription handling for old tiers
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to subscribe to a plan',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    setSubscribing(tier.id);

    try {
      // Create Razorpay order
      const orderResponse = await subscriptionAPI.createOrder(tier.id, user.id);
      const { order_id, amount, currency, key_id } = orderResponse.data;

      // Razorpay checkout options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'ChoosePure',
        description: `${tier.name} Subscription`,
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            await subscriptionAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              tier_id: tier.id
            });

            toast({
              title: 'Success!',
              description: 'Subscription activated successfully',
            });

            // Reload subscription status
            loadUserSubscription();
          } catch (error) {
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support if amount was deducted',
              variant: 'destructive'
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#16a34a'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to initiate payment',
        variant: 'destructive'
      });
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 sm:pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 sm:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Get access to detailed purity scores, test reports, and premium content
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              <CreditCard className="mr-2" size={20} />
              View All Subscription Plans
            </Button>
          </div>
          
          {userSubscription && (
            <div className="mt-6">
              <Badge className="bg-green-600 text-white px-4 py-2">
                Active Subscription - {userSubscription.days_remaining} days remaining
              </Badge>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.slice(0, 3).map((tier, index) => (
            <Card 
              key={tier.id} 
              className={`p-8 ${tier.popular || index === 1 ? 'border-4 border-green-600 shadow-2xl scale-105' : 'border-2'} hover:shadow-xl transition-all`}
            >
              {(tier.popular || index === 1) && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-green-600">₹{tier.price || tier.amount}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {tier.duration_days ? `${tier.duration_days} days access` : 
                   tier.interval ? `per ${tier.interval}` : 'subscription'}
                </p>
              </div>

              <p className="text-gray-600 text-center mb-6">{tier.description}</p>

              <div className="space-y-3 mb-8">
                {tier.features && tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <Check size={20} className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(tier)}
                disabled={subscribing === tier.id || (userSubscription && userSubscription.tier_id === tier.id)}
                className={`w-full ${tier.popular || index === 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {subscribing === tier.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : userSubscription && userSubscription.tier_id === tier.id ? (
                  'Current Plan'
                ) : tier.isNewPlan ? (
                  'Choose Plan'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </Card>
          ))}
        </div>

        {tiers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No subscription plans available at the moment. Please check back later.</p>
          </div>
        )}

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
              <p className="text-gray-600">Test Reports</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">Secure</div>
              <p className="text-gray-600">Payment Gateway</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <p className="text-gray-600">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
};

export default Pricing;
