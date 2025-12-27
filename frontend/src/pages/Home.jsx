import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, Users, FileCheck, UsersRound, Microscope, 
  FileText, AlertTriangle, Star, ArrowRight, TrendingUp,
  Shield, Award, CheckCircle2, Heart
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';
import DonationModal from '../components/DonationModal';
import { 
  testReports, testimonials, communityStats, 
  features, howItWorks, foodDangers 
} from '../mockData';

const Home = () => {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({
    firstName: '',
    mobile: '',
    email: '',
    pincode: ''
  });

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    console.log('Waitlist submission:', waitlistForm);
    toast({
      title: "Welcome to the movement!",
      description: "You've been added to the waitlist. We'll notify you soon.",
    });
    setWaitlistForm({ firstName: '', mobile: '', email: '', pincode: '' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Subscribed!",
      description: "You'll receive our latest updates.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1677132529121-3ea5b62ac9b5?w=1920&q=80"
            alt="Mother with child in premium kitchen"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-in slide-in-from-left duration-700">
              Do you really know what's
              <span className="block mt-2">In your child's food?</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 animate-in slide-in-from-left duration-700 delay-100">
              Join India's first parent-led community that tests food for purity. Together, we ensure every child eats pure.
            </p>
            <a href="#waitlist">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg animate-in slide-in-from-left duration-700 delay-200">
                JOIN THE WAITLIST
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center space-x-2">
              <Shield className="text-green-600" size={24} />
              <span className="font-semibold text-gray-700">FSSAI Approved</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="text-green-600" size={24} />
              <span className="font-semibold text-gray-700">NABL Certified Labs</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="text-green-600" size={24} />
              <span className="font-semibold text-gray-700">100% Transparent</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-green-600" size={24} />
              <span className="font-semibold text-gray-700">{communityStats.totalMembers}+ Parents</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why ChoosePure */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Why Choosepure?</h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-12"></div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-none bg-white">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon === 'FlaskConical' && <FlaskConical className="text-white" size={32} />}
                  {feature.icon === 'Users' && <Users className="text-white" size={32} />}
                  {feature.icon === 'FileCheck' && <FileCheck className="text-white" size={32} />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">How it works?</h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-12"></div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-8 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50 border-green-100">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {index + 1}
                  </div>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
                    {step.icon === 'UsersRound' && <UsersRound className="text-green-600" size={32} />}
                    {step.icon === 'Microscope' && <Microscope className="text-green-600" size={32} />}
                    {step.icon === 'FileText' && <FileText className="text-green-600" size={32} />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/reports">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                SAMPLE TEST REPORT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Power of Community */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Power of Community</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testReports.slice(0, 3).map((report) => (
              <Card key={report.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={report.image} 
                    alt={report.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{report.brand}</h3>
                      <p className="text-gray-600">{report.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-green-600">{report.purityScore}</div>
                      <p className="text-sm text-gray-600">Purity Score</p>
                    </div>
                  </div>
                  <Link to={`/reports/${report.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      View Report
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-6 bg-green-600 text-white">
              <p className="text-lg italic">"Finally someone's testing food for our kids, not just for brands."</p>
              <p className="mt-2 font-semibold">- Ritu, Mom of a 7 year old</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Join Us - Food Dangers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Why Join Us?</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Because the truth about our food is alarming - and we deserve to know...
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {foodDangers.map((danger, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-64">
                  <img 
                    src={danger.image} 
                    alt={danger.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white p-2 rounded-full">
                    <AlertTriangle size={24} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{danger.title}</h3>
                  <Badge variant="destructive" className="mb-4">{danger.subtitle}</Badge>
                  <p className="text-gray-600 leading-relaxed">{danger.description}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-8 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Really in Your Food?</h3>
              <p className="text-gray-700 max-w-2xl">
                And there's no easy way for parents like us to find out which brands are safe. 
                That's why ChoosePure exists — to make independent testing and real transparency 
                accessible to every family.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">What do members say?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/reports">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                View Sample Reports
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-12 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">{communityStats.totalMembers}+</div>
              <div className="text-green-100">Responsible Parents</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{communityStats.testsCompleted}</div>
              <div className="text-green-100">Tests Completed</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{communityStats.productsAnalyzed}</div>
              <div className="text-green-100">Products Analyzed</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">₹{(communityStats.fundsPooled / 1000).toFixed(0)}K</div>
              <div className="text-green-100">Funds Pooled</div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section id="waitlist" className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Join 1,000+ Responsible Parents
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                This isn't just a waitlist -- it's a national movement for truth in food.
              </p>
              <p className="text-gray-600 mb-6">
                Together, we crowd-fund certified tests on everyday products, publish transparent 
                reports, and demand honesty from the food industry.
              </p>
              <p className="text-xl font-semibold text-green-600">No sponsors. No bias.</p>
            </div>
            
            <Card className="p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Waitlist Now</h3>
              <p className="text-gray-600 mb-6">Early access + exclusive benefits</p>
              
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={waitlistForm.firstName}
                    onChange={(e) => setWaitlistForm({...waitlistForm, firstName: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile">Mobile No.*</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={waitlistForm.mobile}
                    onChange={(e) => setWaitlistForm({...waitlistForm, mobile: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={waitlistForm.email}
                    onChange={(e) => setWaitlistForm({...waitlistForm, email: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={waitlistForm.pincode}
                    onChange={(e) => setWaitlistForm({...waitlistForm, pincode: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12">
                  Submit
                </Button>
              </form>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Act Fast! Join the Growing Community Demanding Pure, Safe Food Today!
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Movement Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                When parents unite, purity wins — be part of the ChoosePure movement.
              </h2>
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-semibold text-green-600">How It Works?</h3>
                <p className="text-gray-700">
                  We're bringing together 1000 responsible parents willing to contribute just 
                  Rs 100-200 per month. Each test costs around Rs. 50,000-60,000, so together 
                  we can make independent testing easy and sustainable.
                </p>
                
                <h3 className="text-2xl font-semibold text-green-600 mt-6">Let's Test What Truly Matters - Together</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Which milk brand is actually pure?</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Which flour retains the most bran and nutrients?</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Which spices are free from colorants and heavy metals?</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Which honey meets optimal purity criteria?</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowDonationModal(true)}
              >
                <Heart className="mr-2" size={20} />
                Support Our Mission
              </Button>
            </div>
            
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1665250855519-25e3f817a96f?w=800&q=80"
                alt="Modern Indian family community"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <Heart className="text-red-600 fill-red-600" size={32} />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Help Us Protect Every Child
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your donation directly funds food testing in certified labs. Every contribution helps us uncover the truth about what our children eat and holds brands accountable.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <Card className="p-6 border-2 border-green-200 bg-white">
                <div className="text-3xl font-bold text-green-600 mb-2">₹100</div>
                <p className="text-sm text-gray-600">Tests one product parameter</p>
              </Card>
              <Card className="p-6 border-2 border-green-400 bg-green-50 transform scale-105">
                <div className="text-3xl font-bold text-green-700 mb-2">₹500</div>
                <p className="text-sm text-gray-700 font-semibold">Funds partial product testing</p>
              </Card>
              <Card className="p-6 border-2 border-green-200 bg-white">
                <div className="text-3xl font-bold text-green-600 mb-2">₹1000+</div>
                <p className="text-sm text-gray-600">Complete product analysis</p>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => setShowDonationModal(true)}
              >
                <Heart className="mr-2 fill-white" size={20} />
                Make a Donation
              </Button>
              <p className="text-sm text-gray-500">
                Secure payment via Razorpay • Tax receipts available
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">50,000+</div>
                  <div className="text-sm text-gray-600">Products tested so far</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Parents in community</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Transparency guaranteed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-green-100 mb-6">Get the latest test results and food safety news</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email"
              className="bg-white flex-1"
              required
            />
            <Button type="submit" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Donation Modal */}
      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </div>
  );
};

export default Home;
