import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { reportsAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';

const TestReportForm = ({ report, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: report?.productName || '',
    brand: report?.brand || '',
    category: report?.category || 'Dairy',
    purity_score: report?.purityScore || 9.0,
    test_date: report?.testDate || new Date().toISOString().split('T')[0],
    tested_by: report?.testedBy || 'NABL Certified Lab',
    image: report?.image || '',
    summary: report?.summary || '',
    parameters: report?.parameters || []
  });

  const categories = ['Dairy', 'Sweeteners', 'Oils', 'Spices', 'Grains', 'Beverages', 'Snacks'];
  const labs = ['NABL Certified Lab', 'FSSAI Approved Lab', 'ISO 17025 Lab', 'Food Safety Lab India'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addParameter = () => {
    setFormData({
      ...formData,
      parameters: [...formData.parameters, { name: '', result: '', status: 'pass' }]
    });
  };

  const updateParameter = (index, field, value) => {
    const newParameters = [...formData.parameters];
    newParameters[index][field] = value;
    setFormData({ ...formData, parameters: newParameters });
  };

  const removeParameter = (index) => {
    const newParameters = formData.parameters.filter((_, i) => i !== index);
    setFormData({ ...formData, parameters: newParameters });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (report) {
        await reportsAPI.update(report.id, formData);
      } else {
        await reportsAPI.create(formData);
      }
      toast({
        title: 'Success!',
        description: `Test report ${report ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save test report',
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
          {report ? 'Edit' : 'Add New'} Test Report
        </h3>
        <Button variant="ghost" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              placeholder="e.g., Amul Gold Milk"
            />
          </div>

          <div>
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="e.g., Amul"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="purity_score">Purity Score (0-10) *</Label>
            <Input
              id="purity_score"
              name="purity_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.purity_score}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test_date">Test Date *</Label>
            <Input
              id="test_date"
              name="test_date"
              type="date"
              value={formData.test_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="tested_by">Tested By *</Label>
            <select
              id="tested_by"
              name="tested_by"
              value={formData.tested_by}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              required
            >
              {labs.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="image">Image URL *</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        <div>
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Brief summary of test results..."
          />
        </div>

        {/* Test Parameters */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label>Test Parameters</Label>
            <Button type="button" onClick={addParameter} size="sm" variant="outline">
              <Plus size={16} className="mr-1" />
              Add Parameter
            </Button>
          </div>

          <div className="space-y-3">
            {formData.parameters.map((param, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="Parameter name"
                  value={param.name}
                  onChange={(e) => updateParameter(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Result"
                  value={param.result}
                  onChange={(e) => updateParameter(index, 'result', e.target.value)}
                  className="flex-1"
                />
                <select
                  value={param.status}
                  onChange={(e) => updateParameter(index, 'status', e.target.value)}
                  className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pass">Pass</option>
                  <option value="warning">Warning</option>
                  <option value="fail">Fail</option>
                </select>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeParameter(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Saving...' : (report ? 'Update' : 'Create') + ' Report'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TestReportForm;
