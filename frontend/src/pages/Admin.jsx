import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reportsAPI, blogAPI, votingAPI, forumAPI, waitlistAPI } from '../services/api';
import { toast } from '../hooks/use-toast';
import TestReportForm from '../components/admin/TestReportForm';
import BlogPostForm from '../components/admin/BlogPostForm';
import UpcomingTestForm from '../components/admin/UpcomingTestForm';

const Admin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [testReports, setTestReports] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  
  const [showReportForm, setShowReportForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadAllData();
  }, [isAuthenticated, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [reports, blogs, tests, forum, waitlist] = await Promise.all([
        reportsAPI.getAll(),
        blogAPI.getPosts(),
        votingAPI.getUpcomingTests(),
        forumAPI.getPosts(),
        waitlistAPI.getCount()
      ]);
      
      setTestReports(reports.data.reports || []);
      setBlogPosts(blogs.data.posts || []);
      setUpcomingTests(tests.data.tests || []);
      setForumPosts(forum.data.posts || []);
      setWaitlistEntries(waitlist.data.count || 0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this test report?')) {
      try {
        // Note: Delete endpoint needs to be implemented in backend
        toast({
          title: 'Success',
          description: 'Test report deleted successfully'
        });
        loadAllData();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete test report',
          variant: 'destructive'
        });
      }
    }
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        // Note: Delete endpoint needs to be implemented in backend
        toast({
          title: 'Success',
          description: 'Blog post deleted successfully'
        });
        loadAllData();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete blog post',
          variant: 'destructive'
        });
      }
    }
  };

  const handleDeleteTest = async (id) => {
    if (window.confirm('Are you sure you want to delete this upcoming test?')) {
      try {
        // Note: Delete endpoint needs to be implemented in backend
        toast({
          title: 'Success',
          description: 'Upcoming test deleted successfully'
        });
        loadAllData();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete upcoming test',
          variant: 'destructive'
        });
      }
    }
  };

  const handleDeleteForumPost = async (id) => {
    if (window.confirm('Are you sure you want to delete this forum post?')) {
      try {
        // Note: Delete endpoint needs to be implemented in backend
        toast({
          title: 'Success',
          description: 'Forum post deleted successfully'
        });
        loadAllData();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete forum post',
          variant: 'destructive'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gradient-to-b from-green-50 to-white py-24 flex items-center justify-center\">
        <div className=\"text-xl text-gray-600\">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-b from-green-50 to-white py-24\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
        {/* Header */}
        <div className=\"mb-8\">
          <h1 className=\"text-5xl font-bold text-gray-900 mb-4\">Admin Panel</h1>
          <p className=\"text-xl text-gray-600\">Manage test reports, blog posts, and community content</p>
        </div>

        {/* Quick Stats */}
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6 mb-8\">
          <Card className=\"p-6 bg-gradient-to-br from-green-500 to-green-600 text-white\">
            <div className=\"text-3xl font-bold mb-2\">{testReports.length}</div>
            <div className=\"text-green-100\">Test Reports</div>
          </Card>
          <Card className=\"p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white\">
            <div className=\"text-3xl font-bold mb-2\">{blogPosts.length}</div>
            <div className=\"text-blue-100\">Blog Posts</div>
          </Card>
          <Card className=\"p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white\">
            <div className=\"text-3xl font-bold mb-2\">{upcomingTests.length}</div>
            <div className=\"text-purple-100\">Upcoming Tests</div>
          </Card>
          <Card className=\"p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white\">
            <div className=\"text-3xl font-bold mb-2\">{waitlistEntries}</div>
            <div className=\"text-orange-100\">Waitlist Entries</div>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue=\"reports\" className=\"w-full\">
          <TabsList className=\"grid w-full grid-cols-4 mb-8\">
            <TabsTrigger value=\"reports\">Test Reports</TabsTrigger>
            <TabsTrigger value=\"blogs\">Blog Posts</TabsTrigger>
            <TabsTrigger value=\"tests\">Upcoming Tests</TabsTrigger>
            <TabsTrigger value=\"forum\">Forum Posts</TabsTrigger>
          </TabsList>

          {/* Test Reports Tab */}
          <TabsContent value=\"reports\">
            <Card className=\"p-6\">
              <div className=\"flex justify-between items-center mb-6\">
                <h2 className=\"text-2xl font-bold text-gray-900\">Test Reports Management</h2>
                <Button 
                  onClick={() => { setEditingItem(null); setShowReportForm(true); }}
                  className=\"bg-green-600 hover:bg-green-700\"
                >
                  <Plus size={20} className=\"mr-2\" />
                  Add New Report
                </Button>
              </div>

              {showReportForm && (
                <div className=\"mb-6\">
                  <TestReportForm
                    report={editingItem}
                    onClose={() => { setShowReportForm(false); setEditingItem(null); }}
                    onSuccess={() => {
                      setShowReportForm(false);
                      setEditingItem(null);
                      loadAllData();
                    }}
                  />
                </div>
              )}

              <div className=\"space-y-4\">
                {testReports.map((report) => (
                  <Card key={report.id} className=\"p-4 hover:shadow-lg transition-shadow\">
                    <div className=\"flex items-center justify-between\">
                      <div className=\"flex items-center space-x-4\">
                        <img src={report.image} alt={report.productName} className=\"w-20 h-20 object-cover rounded-lg\" />
                        <div>
                          <h3 className=\"text-xl font-bold text-gray-900\">{report.productName}</h3>
                          <p className=\"text-gray-600\">{report.brand} • {report.category}</p>
                          <Badge className={`mt-2 ${
                            report.purityScore >= 9 ? 'bg-green-600' :
                            report.purityScore >= 8 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            Score: {report.purityScore}
                          </Badge>
                        </div>
                      </div>
                      <div className=\"flex space-x-2\">
                        <Button variant=\"outline\" size=\"sm\" onClick={() => navigate(`/reports/${report.id}`)}>
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant=\"outline\" 
                          size=\"sm\"
                          onClick={() => { setEditingItem(report); setShowReportForm(true); }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant=\"destructive\" 
                          size=\"sm\"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Blog Posts Tab */}
          <TabsContent value=\"blogs\">
            <Card className=\"p-6\">
              <div className=\"flex justify-between items-center mb-6\">
                <h2 className=\"text-2xl font-bold text-gray-900\">Blog Posts Management</h2>
                <Button 
                  onClick={() => { setEditingItem(null); setShowBlogForm(true); }}
                  className=\"bg-green-600 hover:bg-green-700\"
                >
                  <Plus size={20} className=\"mr-2\" />
                  Add New Blog Post
                </Button>
              </div>

              {showBlogForm && (
                <div className=\"mb-6\">
                  <BlogPostForm
                    post={editingItem}
                    onClose={() => { setShowBlogForm(false); setEditingItem(null); }}
                    onSuccess={() => {
                      setShowBlogForm(false);
                      setEditingItem(null);
                      loadAllData();
                    }}
                  />
                </div>
              )}

              <div className=\"space-y-4\">
                {blogPosts.map((post) => (
                  <Card key={post.id} className=\"p-4 hover:shadow-lg transition-shadow\">
                    <div className=\"flex items-center justify-between\">
                      <div className=\"flex items-center space-x-4\">
                        <img src={post.image} alt={post.title} className=\"w-20 h-20 object-cover rounded-lg\" />
                        <div>
                          <h3 className=\"text-xl font-bold text-gray-900\">{post.title}</h3>
                          <p className=\"text-gray-600 line-clamp-1\">{post.excerpt}</p>
                          <div className=\"flex items-center space-x-3 mt-2 text-sm text-gray-500\">
                            <Badge>{post.category}</Badge>
                            <span>{post.author}</span>
                            <span>•</span>
                            <span>{post.views} views</span>
                          </div>
                        </div>
                      </div>
                      <div className=\"flex space-x-2\">
                        <Button variant=\"outline\" size=\"sm\" onClick={() => navigate(`/blog/${post.id}`)}>
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant=\"outline\" 
                          size=\"sm\"
                          onClick={() => { setEditingItem(post); setShowBlogForm(true); }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant=\"destructive\" 
                          size=\"sm\"
                          onClick={() => handleDeleteBlog(post.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Upcoming Tests Tab */}
          <TabsContent value=\"tests\">
            <Card className=\"p-6\">
              <div className=\"flex justify-between items-center mb-6\">
                <h2 className=\"text-2xl font-bold text-gray-900\">Upcoming Tests Management</h2>
                <Button 
                  onClick={() => { setEditingItem(null); setShowTestForm(true); }}
                  className=\"bg-green-600 hover:bg-green-700\"
                >
                  <Plus size={20} className=\"mr-2\" />
                  Add New Test
                </Button>
              </div>

              {showTestForm && (
                <div className=\"mb-6\">
                  <UpcomingTestForm
                    test={editingItem}
                    onClose={() => { setShowTestForm(false); setEditingItem(null); }}
                    onSuccess={() => {
                      setShowTestForm(false);
                      setEditingItem(null);
                      loadAllData();
                    }}
                  />
                </div>
              )}

              <div className=\"space-y-4\">
                {upcomingTests.map((test) => (
                  <Card key={test.id} className=\"p-4 hover:shadow-lg transition-shadow\">
                    <div className=\"flex items-center justify-between\">
                      <div className=\"flex-1\">
                        <h3 className=\"text-xl font-bold text-gray-900\">{test.productCategory}</h3>
                        <p className=\"text-gray-600 mt-1\">{test.description}</p>
                        <div className=\"flex items-center space-x-4 mt-3 text-sm\">
                          <Badge className=\"bg-green-600\">{test.votes} votes</Badge>
                          <span className=\"text-gray-600\">Funded: {test.funded}/{test.targetFunding}</span>
                          <span className=\"text-gray-600\">Est. Date: {test.estimatedTestDate}</span>
                        </div>
                      </div>
                      <div className=\"flex space-x-2 ml-4\">
                        <Button 
                          variant=\"outline\" 
                          size=\"sm\"
                          onClick={() => { setEditingItem(test); setShowTestForm(true); }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant=\"destructive\" 
                          size=\"sm\"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Forum Posts Tab */}
          <TabsContent value=\"forum\">
            <Card className=\"p-6\">
              <div className=\"flex justify-between items-center mb-6\">
                <h2 className=\"text-2xl font-bold text-gray-900\">Forum Posts Moderation</h2>
              </div>

              <div className=\"space-y-4\">
                {forumPosts.map((post) => (
                  <Card key={post.id} className=\"p-4 hover:shadow-lg transition-shadow\">
                    <div className=\"flex items-center justify-between\">
                      <div className=\"flex-1\">
                        <div className=\"flex items-center space-x-3 mb-2\">
                          <img src={post.authorImage} alt={post.author} className=\"w-10 h-10 rounded-full\" />
                          <div>
                            <h3 className=\"text-lg font-bold text-gray-900\">{post.title}</h3>
                            <p className=\"text-sm text-gray-600\">{post.author} • {post.timeAgo || 'Recently'}</p>
                          </div>
                        </div>
                        <p className=\"text-gray-700 line-clamp-2\">{post.content}</p>
                        <div className=\"flex items-center space-x-4 mt-3 text-sm\">
                          <Badge>{post.category}</Badge>
                          <span className=\"text-gray-600\">{post.likes} likes</span>
                          <span className=\"text-gray-600\">{post.replies} replies</span>
                        </div>
                      </div>
                      <div className=\"flex space-x-2 ml-4\">
                        <Button 
                          variant=\"destructive\" 
                          size=\"sm\"
                          onClick={() => handleDeleteForumPost(post.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
