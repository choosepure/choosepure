import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Youtube, Facebook, Instagram, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (credentials) => {
    // Mock login
    console.log('Login:', credentials);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleDashboardClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-600 to-green-700 rounded-full transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                  <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18l5.5 3.44v6.76L12 17.82l-5.5-3.44V7.62L12 4.18z"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">choosepure</h1>
                <p className="text-xs text-green-600 font-medium tracking-wider">HEALTHIER LIFE</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">HOME</Link>
              <Link to="/reports" className="text-gray-700 hover:text-green-600 font-medium transition-colors">REPORTS</Link>
              <Link to="/forum" className="text-gray-700 hover:text-green-600 font-medium transition-colors">FORUM</Link>
              <Link to="/blog" className="text-gray-700 hover:text-green-600 font-medium transition-colors">BLOG</Link>
              <button onClick={handleDashboardClick} className="text-gray-700 hover:text-green-600 font-medium transition-colors">DASHBOARD</button>
            </div>

            {/* Social Icons & Auth */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors">
                <Instagram size={20} />
              </a>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleDashboardClick}>
                    <User size={18} className="mr-1" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut size={18} />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLoginModal(true)} className="bg-green-600 hover:bg-green-700">
                  Login
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-green-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-gray-700 hover:text-green-600 font-medium py-2">HOME</Link>
              <Link to="/reports" className="block text-gray-700 hover:text-green-600 font-medium py-2">REPORTS</Link>
              <Link to="/forum" className="block text-gray-700 hover:text-green-600 font-medium py-2">FORUM</Link>
              <Link to="/blog" className="block text-gray-700 hover:text-green-600 font-medium py-2">BLOG</Link>
              <button onClick={handleDashboardClick} className="block w-full text-left text-gray-700 hover:text-green-600 font-medium py-2">DASHBOARD</button>
              {!isLoggedIn && (
                <Button onClick={() => setShowLoginModal(true)} className="w-full bg-green-600 hover:bg-green-700 mt-4">
                  Login
                </Button>
              )}
              {isLoggedIn && (
                <Button onClick={handleLogout} variant="outline" className="w-full mt-2">
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Navbar;
