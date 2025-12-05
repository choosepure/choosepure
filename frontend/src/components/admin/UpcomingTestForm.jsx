import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { votingAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';

const UpcomingTestForm = ({ test, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_category: test?.productCategory || '',
    description: test?.description || '',
    estimated_test_date: test?.estimatedTestDate || '',
    target_funding: test?.targetFunding || 100
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (test) {
        await votingAPI.updateTest(test.id, formData);
      } else {
        await votingAPI.createTest(formData);
      }
      toast({
        title: 'Success!',
        description: `Upcoming test ${test ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save upcoming test',
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
          {test ? 'Edit' : 'Add New'} Upcoming Test
        </h3>
        <Button variant="ghost" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="product_category">Product Category *</Label>
          <Input
            id="product_category"
            name="product_category"
            value={formData.product_category}
            onChange={handleChange}
            required
            placeholder="e.g., Cooking Oil, Turmeric Powder"
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
            placeholder="What will be tested and why..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimated_test_date">Estimated Test Date *</Label>
            <Input
              id="estimated_test_date"
              name="estimated_test_date"
              type="date"
              value={formData.estimated_test_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="target_funding">Target Funding (Members) *</Label>
            <Input
              id="target_funding"
              name="target_funding"
              type="number"
              min="1"
              value={formData.target_funding}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Saving...' : (test ? 'Update' : 'Create') + ' Test'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UpcomingTestForm;
