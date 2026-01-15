import React, { useState } from 'react';
import { 
  TrendingUp, Users, FlaskConical, Heart, Award, 
  Vote, MessageSquare, FileText, Bell, Settings,
  CheckCircle2, Clock
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from '../hooks/use-toast';
import { 
  communityStats, upcomingTests, testReports, 
  blogPosts 
} from '../mockData';

const Dashboard = () => {
  const [votedTests, setVotedTests] = useState([]);

  const handleVote = (testId) => {
    if (votedTests.includes(testId)) {
      toast({
        title: "Already Voted",
        description: "You've already voted for this test.",
      });
      return;
    }
    
    setVotedTests([...votedTests, testId]);
    toast({
      title: "Vote Recorded!",
      description: "Thank you for helping us prioritize testing.",
    });
  };

  const handleContribute = () => {
    toast({
      title: "Coming Soon!",
      description: "Contribution feature will be available soon.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Community Dashboard</h1>
          <p className="text-xl text-gray-600">Your hub for testing, voting, and community engagement</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <Users size={32} />
              <TrendingUp size={20} className="text-green-200" />
            </div>
            <div className="text-4xl font-bold mb-2">{communityStats.totalMembers}+</div>
            <div className="text-green-100">Community Members</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <FlaskConical size={32} />
              <CheckCircle2 size={20} className="text-blue-200" />
            </div>
            <div className="text-4xl font-bold mb-2">{communityStats.testsCompleted}</div>
            <div className="text-blue-100">Tests Completed</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <FileText size={32} />
              <Award size={20} className="text-purple-200" />
            </div>
            <div className="text-4xl font-bold mb-2">{communityStats.productsAnalyzed}</div>
            <div className="text-purple-100">Products Analyzed</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <Heart size={32} />
              <TrendingUp size={20} className="text-orange-200" />
            </div>
            <div className="text-4xl font-bold mb-2">₹{(communityStats.fundsPooled / 1000).toFixed(0)}K</div>
            <div className="text-orange-100">Funds Pooled</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vote for Next Tests */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Vote className="text-green-600" size={28} />
                  <h2 className="text-3xl font-bold text-gray-900">Vote for Next Tests</h2>
                </div>
                <Badge className="bg-green-600 text-lg px-3 py-1">{upcomingTests.length} Active</Badge>
              </div>
              
              <div className="space-y-6">
                {upcomingTests.map((test) => (
                  <Card key={test.id} className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{test.productCategory}</h3>
                        <p className="text-gray-600 text-sm mb-3">{test.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Vote size={16} className="text-green-600" />
                            <span className="font-semibold">{test.votes} votes</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={16} className="text-gray-500" />
                            <span className="text-gray-600">Est. {test.estimatedTestDate}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleVote(test.id)}
                        disabled={votedTests.includes(test.id)}
                        className={`ml-4 ${
                          votedTests.includes(test.id) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {votedTests.includes(test.id) ? 'Voted' : 'Vote'}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Funding Progress</span>
                        <span className="font-semibold text-green-600">{test.funded}/{test.targetFunding} members</span>
                      </div>
                      <Progress value={test.funded} className="h-2" />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Recent Test Results */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FlaskConical className="text-green-600" size={28} />
                  <h2 className="text-3xl font-bold text-gray-900">Recent Test Results</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                {testReports.slice(0, 3).map((report) => (
                  <Card key={report.id} className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-4">
                      <img
                        src={report.image}
                        alt={report.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{report.productName}</h4>
                        <p className="text-sm text-gray-600 mb-2">{report.brand} • {report.category}</p>
                        <Badge className={`${
                          report.purityScore >= 9 ? 'bg-green-600' :
                          report.purityScore >= 8 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}>
                          Score: {report.purityScore}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Your Contribution */}
            <Card className="p-6 bg-gradient-to-br from-green-600 to-teal-600 text-white">
              <h3 className="text-2xl font-bold mb-4">Your Impact</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span>Tests Contributed</span>
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Votes Cast</span>
                  <span className="text-2xl font-bold">{votedTests.length}</span>
                </div>
              </div>
              <Button 
                onClick={handleContribute}
                className="w-full bg-white text-green-600 hover:bg-gray-100"
              >
                Contribute Now
              </Button>
            </Card>

            {/* Latest Articles */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Latest Articles</h3>
              </div>
              <div className="space-y-3">
                {blogPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="pb-3 border-b last:border-b-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 hover:text-green-600 cursor-pointer">
                      {post.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Bell size={18} className="mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings size={18} className="mr-2" />
                  Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
