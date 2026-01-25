import React, { useState, useEffect } from 'react';
import { 
  Vote, Plus, Share2, Users, Clock, CheckCircle2, 
  TrendingUp, Award, Zap, Crown, ExternalLink
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from '../hooks/use-toast';
import { productVotingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Voting = () => {
  const { user, isAuthenticated } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [userVotes, setUserVotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [votingStats, setVotingStats] = useState(null);
  
  const [newSuggestion, setNewSuggestion] = useState({
    product_name: '',
    brand: '',
    category: 'Dairy',
    description: ''
  });

  const categories = ['Dairy', 'Sweeteners', 'Oils', 'Spices', 'Grains', 'Beverages', 'Snacks'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suggestionsRes, userVotesRes, statsRes] = await Promise.all([
        productVotingAPI.getSuggestions(),
        isAuthenticated ? productVotingAPI.getUserVotes() : Promise.resolve({ data: { data: null } }),
        productVotingAPI.getStats()
      ]);

      if (suggestionsRes.data.success) {
        setSuggestions(suggestionsRes.data.data.suggestions);
      }

      if (userVotesRes.data?.success) {
        setUserVotes(userVotesRes.data.data);
      }

      if (statsRes.data.success) {
        setVotingStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error loading voting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load voting data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (suggestionId) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to vote for products',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await productVotingAPI.vote({ product_suggestion_id: suggestionId });
      
      if (response.data.success) {
        toast({
          title: 'Vote Recorded!',
          description: response.data.message,
        });
        
        // Refresh data to show updated vote counts
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Vote Failed',
        description: error.response?.data?.detail || 'Failed to record vote',
        variant: 'destructive'
      });
    }
  };

  const handleCreateSuggestion = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to suggest products',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await productVotingAPI.createSuggestion(newSuggestion);
      
      if (response.data.success) {
        toast({
          title: 'Suggestion Created!',
          description: 'Your product suggestion has been added for voting',
        });
        
        setShowCreateForm(false);
        setNewSuggestion({
          product_name: '',
          brand: '',
          category: 'Dairy',
          description: ''
        });
        
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error.response?.data?.detail || 'Failed to create suggestion',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async (suggestion, platform) => {
    try {
      const response = await productVotingAPI.shareProduct(suggestion.id, platform);
      
      if (response.data.success) {
        const shareData = response.data.data;
        const shareText = `Help me get ${shareData.product_name} by ${shareData.brand} tested for purity! Only ${shareData.votes_needed} more votes needed. Join the community at ${shareData.share_url}`;
        
        if (platform === 'whatsapp') {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'twitter') {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'copy') {
          navigator.clipboard.writeText(shareText);
          toast({
            title: 'Copied!',
            description: 'Share text copied to clipboard',
          });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const hasUserVoted = (suggestion) => {
    return userVotes?.voted_products?.some(vote => vote.id === suggestion.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 sm:pt-24 pb-12 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading voting data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20 sm:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Community Voting</h1>
          <p className="text-xl text-gray-600 mb-6">Vote for products you want tested. 350 votes = guaranteed testing!</p>
          
          {/* User voting status */}
          {isAuthenticated && userVotes && (
            <div className="flex justify-center items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <Vote className="text-green-600" size={20} />
                <span className="text-sm text-gray-600">
                  Votes used: {userVotes.monthly_votes_used}/{userVotes.monthly_vote_limit}
                </span>
                {userVotes.is_premium && (
                  <Crown className="text-yellow-500" size={16} />
                )}
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Suggest Product
              </Button>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {votingStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{votingStats.active_voting}</div>
              <div className="text-sm text-gray-600">Active Voting</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{votingStats.testing_phase}</div>
              <div className="text-sm text-gray-600">In Testing</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{votingStats.completed_tests}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{votingStats.total_votes}</div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{votingStats.total_suggestions}</div>
              <div className="text-sm text-gray-600">All Products</div>
            </Card>
          </div>
        )}

        {/* Create Suggestion Form */}
        {showCreateForm && (
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Suggest a Product for Testing</h2>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                ×
              </Button>
            </div>
            
            <form onSubmit={handleCreateSuggestion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    value={newSuggestion.product_name}
                    onChange={(e) => setNewSuggestion({...newSuggestion, product_name: e.target.value})}
                    placeholder="e.g., Organic Whole Milk"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={newSuggestion.brand}
                    onChange={(e) => setNewSuggestion({...newSuggestion, brand: e.target.value})}
                    placeholder="e.g., Amul"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={newSuggestion.category}
                  onChange={(e) => setNewSuggestion({...newSuggestion, category: e.target.value})}
                  className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-gray-900"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="description">Why should we test this product? *</Label>
                <Textarea
                  id="description"
                  value={newSuggestion.description}
                  onChange={(e) => setNewSuggestion({...newSuggestion, description: e.target.value})}
                  placeholder="Explain why this product needs testing..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Submit Suggestion
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Product Suggestions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{suggestion.product_name}</h3>
                    <p className="text-gray-600 mb-2">{suggestion.brand}</p>
                    <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                  </div>
                  {suggestion.suggested_by_admin && (
                    <Badge className="bg-purple-600 text-white">
                      <Award size={12} className="mr-1" />
                      Admin Pick
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{suggestion.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-gray-500" />
                      <span className="text-sm font-semibold">{suggestion.votes} / {suggestion.vote_threshold} votes</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(suggestion.progress_percentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={suggestion.progress_percentage} 
                    className="h-2"
                  />
                </div>

                {/* Time estimate */}
                {suggestion.estimated_completion_days && (
                  <div className="flex items-center space-x-1 mb-4 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>Est. {suggestion.estimated_completion_days} days to reach threshold</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleVote(suggestion.id)}
                      disabled={!isAuthenticated || hasUserVoted(suggestion) || (userVotes?.votes_remaining <= 0)}
                      size="sm"
                      className={`${
                        hasUserVoted(suggestion) 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {hasUserVoted(suggestion) ? (
                        <>
                          <CheckCircle2 size={14} className="mr-1" />
                          Voted
                        </>
                      ) : (
                        <>
                          <Vote size={14} className="mr-1" />
                          Vote
                        </>
                      )}
                    </Button>
                    
                    <div className="relative group">
                      <Button variant="outline" size="sm">
                        <Share2 size={14} />
                      </Button>
                      
                      {/* Share dropdown */}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white border rounded-lg shadow-lg p-2 z-10">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(suggestion, 'whatsapp')}
                            className="text-green-600"
                          >
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(suggestion, 'twitter')}
                            className="text-blue-600"
                          >
                            Twitter
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(suggestion, 'copy')}
                            className="text-gray-600"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Threshold indicator */}
                  {suggestion.progress_percentage >= 100 && (
                    <Badge className="bg-green-600">
                      <Zap size={12} className="mr-1" />
                      Testing Soon!
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {suggestions.length === 0 && (
          <div className="text-center py-12">
            <Vote className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products to vote on yet</h3>
            <p className="text-gray-600 mb-6">Be the first to suggest a product for testing!</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus size={16} className="mr-2" />
              Suggest First Product
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <h3 className="text-2xl font-bold mb-4">Join the Movement</h3>
            <p className="mb-6">Help us test the products that matter to your family</p>
            {!isAuthenticated ? (
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Login to Start Voting
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={() => setShowCreateForm(true)}
              >
                Suggest a Product
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Voting;