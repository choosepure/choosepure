import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Search, Plus } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from '../components/ui/use-toast';
import { forumPosts } from '../mockData';

const Forum = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Test Results', 'Voting', 'Tips & Tricks', 'Announcements', 'General Discussion'];

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewPost = () => {
    toast({
      title: "Feature Coming Soon!",
      description: "You'll be able to create posts once you're logged in.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Community Forum</h1>
          <p className="text-xl text-gray-600">Connect with fellow parents and share your food safety journey</p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button onClick={handleNewPost} className="bg-green-600 hover:bg-green-700">
                <Plus size={20} className="mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </div>

        {/* Forum Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-green-600 cursor-pointer">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="font-semibold">{post.author}</span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                      <ThumbsUp size={18} />
                      <span>{post.likes} likes</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                      <MessageCircle size={18} />
                      <span>{post.replies} replies</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No discussions found matching your criteria.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <h3 className="text-2xl font-bold mb-4">Join the Conversation</h3>
            <p className="mb-6">Be part of India's most active food safety community</p>
            <Button onClick={handleNewPost} size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              Start a Discussion
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forum;
