import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Youtube, Facebook, Instagram, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import ShareButton from './ShareButton';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
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
            <Link to="/" className="flex items-center group">
              <img 
                src="/logo.png" 
                alt="ChoosePure" 
                className="h-12 w-auto transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">HOME</Link>
              <Link to="/reports" className="text-gray-700 hover:text-green-600 font-medium transition-colors">REPORTS</Link>
              <Link to="/blog" className="text-gray-700 hover:text-green-600 font-medium transition-colors">BLOG</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-green-600 font-medium transition-colors">PRICING</Link>
              <button onClick={handleDashboardClick} className="text-gray-700 hover:text-green-600 font-medium transition-colors">DASHBOARD</button>
              {isAuthenticated && user?.isAdmin && (
                <Link to="/admin" className="text-gray-700 hover:text-green-600 font-medium transition-colors">ADMIN</Link>
              )}
            </div>

            {/* Social Icons & Auth */}
            <div className="hidden md:flex items-center space-x-4">
              <ShareButton size="sm" variant="ghost" />
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
              {isAuthenticated ? (
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
              <Link to="/blog" className="block text-gray-700 hover:text-green-600 font-medium py-2">BLOG</Link>
              <Link to="/pricing" className="block text-gray-700 hover:text-green-600 font-medium py-2">PRICING</Link>
              <button onClick={handleDashboardClick} className="block w-full text-left text-gray-700 hover:text-green-600 font-medium py-2">DASHBOARD</button>
              {isAuthenticated && user?.isAdmin && (
                <Link to="/admin" className="block text-gray-700 hover:text-green-600 font-medium py-2">ADMIN</Link>
              )}
              
              <div className="pt-4 border-t">
                <ShareButton size="default" variant="outline" />
              </div>
              
              {!isAuthenticated && (
                <Button onClick={() => setShowLoginModal(true)} className="w-full bg-green-600 hover:bg-green-700 mt-4">
                  Login
                </Button>
              )}
              {isAuthenticated && (
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
      />
    </>
  );
};

export default Navbar;
