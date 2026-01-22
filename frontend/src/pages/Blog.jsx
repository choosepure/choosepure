import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { blogPosts } from '../mockData';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 sm:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600">Insights, tips, and news about food safety</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Featured Post */}
        {!searchTerm && (
          <Card className="overflow-hidden mb-12 hover:shadow-2xl transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-96 md:h-auto">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge className="mb-4 w-fit bg-green-600">{featuredPost.category}</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-green-600 cursor-pointer">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{featuredPost.publishDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye size={16} />
                    <span>{featuredPost.views} views</span>
                  </div>
                </div>
                <Link to={`/blog/${featuredPost.id}`}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Read More
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(searchTerm ? filteredPosts : recentPosts).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <Badge className="mb-3 bg-green-600">{post.category}</Badge>
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-green-600 cursor-pointer line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye size={14} />
                    <span>{post.views}</span>
                  </div>
                </div>
                <Link to={`/blog/${post.id}`}>
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                    Read Article
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No articles found matching your search.</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16">
          <Card className="p-8 text-center bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <h3 className="text-3xl font-bold mb-4">Never Miss an Update</h3>
            <p className="text-green-100 mb-6">Subscribe to get the latest articles delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white text-gray-900 flex-1"
              />
              <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;
