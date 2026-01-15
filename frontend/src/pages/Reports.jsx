import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ExternalLink, Lock, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const Reports = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [reports, setReports] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Dairy', 'Sweeteners', 'Oils', 'Spices', 'Grains', 'Beverages', 'Snacks'];

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.id) {
        params.user_id = user.id;
      }
      
      const response = await reportsAPI.getAll(params);
      setReports(response.data.reports || []);
      setIsSubscribed(response.data.is_subscribed || false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Test Reports</h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">Transparent, unbiased food testing results from certified labs</p>
          
          {!isSubscribed && (
            <div className="mt-4 sm:mt-6">
              <Badge className="bg-yellow-600 text-white px-3 sm:px-4 py-2 text-sm">
                Subscribe to view detailed purity scores
              </Badge>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by product name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReports.map((report) => (
            <Card key={report.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-48">
                <img
                  src={report.image}
                  alt={report.productName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  {isSubscribed && report.purityScore ? (
                    <Badge 
                      className={`text-lg px-3 py-1 ${
                        report.purityScore >= 9 ? 'bg-green-600' :
                        report.purityScore >= 8 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                    >
                      {report.purityScore}
                    </Badge>
                  ) : (
                    <Badge className="text-lg px-3 py-1 bg-gray-600 flex items-center gap-1">
                      <Lock size={14} />
                      Subscribe
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{report.productName}</h3>
                    <p className="text-gray-600">{report.brand}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{report.category}</Badge>
                  <span className="text-sm text-gray-500">{report.testDate}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{report.summary}</p>
                
                {!isSubscribed ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center">
                    <Lock className="mx-auto mb-2 text-gray-400" size={24} />
                    <p className="text-sm text-gray-600 mb-2">Detailed test parameters are available to subscribers</p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/pricing')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      View Plans
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {report.parameters && report.parameters.slice(0, 2).map((param, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{param.name}:</span>
                        <span className={`font-semibold ${
                          param.status === 'pass' ? 'text-green-600' : 'text-yellow-600'
                        }`}>{param.result}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <Link to={`/reports/${report.id}`}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    View Full Report
                    <ExternalLink size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No reports found matching your criteria.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <h3 className="text-2xl font-bold mb-4">Want to see your favorite brand tested?</h3>
            <p className="mb-6">Vote for the next product to be tested by our community</p>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Vote Now
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
