import React, { useState } from 'react';
import { X, Heart, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { donationAPI } from '../services/api';
import { toast } from '../hooks/use-toast';

const DonationModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    message: ''
  });

  const suggestedAmounts = [100, 500, 1000, 2000, 5000];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDonate = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount < 10) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter an amount of at least ₹10',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.donor_name || !formData.donor_email) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your name and email',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await donationAPI.createOrder({
        amount: amount,
        donor_name: formData.donor_name,
        donor_email: formData.donor_email,
        donor_phone: formData.donor_phone,
        message: formData.message
      });

      const { order_id, key_id } = orderResponse.data;

      // Razorpay checkout options
      const options = {
        key: key_id,
        amount: amount * 100,
        currency: 'INR',
        name: 'ChoosePure',
        description: 'Support Food Safety for Children',
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            await donationAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donor_name: formData.donor_name,
              donor_email: formData.donor_email,
              donor_phone: formData.donor_phone,
              amount: amount,
              message: formData.message
            });

            toast({
              title: 'Thank You! 🎉',
              description: 'Your generous donation helps us test food and keep children safe!',
            });

            onClose();
          } catch (error) {
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support if amount was deducted',
              variant: 'destructive'
            });
          }
        },
        prefill: {
          name: formData.donor_name,
          email: formData.donor_email,
          contact: formData.donor_phone
        },
        theme: {
          color: '#16a34a'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to initiate donation',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="text-red-500 fill-red-500" size={32} />
              Support Our Cause
            </h2>
            <p className="text-gray-600 mt-2">
              Help us test food products and protect children's health
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            <X size={24} />
          </Button>
        </div>

        {/* Suggested Amounts */}
        <div className="mb-6">
          <Label className="text-lg font-semibold mb-3 block">Choose Amount</Label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {suggestedAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                  selectedAmount === amount
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Label htmlFor="custom_amount">Or enter custom amount (₹)</Label>
            <Input
              id="custom_amount"
              type="number"
              min="10"
              placeholder="Enter amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="mt-2"
            />
          </div>
        </div>

        {/* Donor Information */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="donor_name">Your Name *</Label>
            <Input
              id="donor_name"
              name="donor_name"
              value={formData.donor_name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="donor_email">Email *</Label>
            <Input
              id="donor_email"
              name="donor_email"
              type="email"
              value={formData.donor_email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="donor_phone">Phone (Optional)</Label>
            <Input
              id="donor_phone"
              name="donor_phone"
              type="tel"
              value={formData.donor_phone}
              onChange={handleChange}
              placeholder="9876543210"
            />
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Leave a message of support..."
              rows={3}
            />
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-2">Your Impact:</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• ₹100 helps test one product parameter</li>
            <li>• ₹500 funds partial testing of a product</li>
            <li>• ₹1000+ supports complete product testing</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDonate}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Donate ₹{selectedAmount || customAmount || '...'}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DonationModal;
