import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { subscriptionAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';

const SubscriptionTierForm = ({ tier, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tier?.name || '',
    price: tier?.price || 0,
    duration_days: tier?.duration_days || 30,
    description: tier?.description || '',
    features: tier?.features || [],
    is_active: tier?.is_active ?? true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days)
      };

      if (tier) {
        await subscriptionAPI.updateTier(tier.id, submitData);
      } else {
        await subscriptionAPI.createTier(submitData);
      }
      
      toast({
        title: 'Success!',
        description: `Subscription tier ${tier ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save subscription tier',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {tier ? 'Edit' : 'Add New'} Subscription Tier
        </h3>
        <Button variant="ghost" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Basic, Premium, Annual"
            />
          </div>

          <div>
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="duration_days">Duration (Days) *</Label>
          <Input
            id="duration_days"
            name="duration_days"
            type="number"
            min="1"
            value={formData.duration_days}
            onChange={handleChange}
            required
            placeholder="30"
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Brief description of this plan..."
          />
        </div>

        {/* Features */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label>Features</Label>
            <Button type="button" onClick={addFeature} size="sm" variant="outline">
              <Plus size={16} className="mr-1" />
              Add Feature
            </Button>
          </div>

          <div className="space-y-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="Feature description"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Active (visible to users)
          </Label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Saving...' : (tier ? 'Update' : 'Create') + ' Tier'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SubscriptionTierForm;
