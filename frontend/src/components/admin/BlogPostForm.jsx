import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { blogAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';

const BlogPostForm = ({ post, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    author: post?.author || 'Team ChoosePure',
    category: post?.category || 'Food Safety',
    image: post?.image || '',
    publish_date: post?.publishDate || new Date().toISOString().split('T')[0]
  });

  const categories = ['Food Safety', 'Education', 'Behind the Scenes', 'DIY Tips', 'Community', 'News'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await blogAPI.create(formData);
      toast({
        title: 'Success!',
        description: `Blog post ${post ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save blog post',
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
          {post ? 'Edit' : 'Add New'} Blog Post
        </h3>
        <Button variant="ghost" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Blog post title..."
          />
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            required
            rows={2}
            placeholder="Brief summary for preview..."
          />
        </div>

        <div>
          <Label htmlFor="content">Content (HTML) *</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            placeholder="Full blog post content in HTML..."
            className="font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              placeholder="Author name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="image">Featured Image URL *</Label>
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
            <Label htmlFor="publish_date">Publish Date *</Label>
            <Input
              id="publish_date"
              name="publish_date"
              type="date"
              value={formData.publish_date}
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
            {loading ? 'Saving...' : (post ? 'Update' : 'Publish') + ' Post'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BlogPostForm;
