import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <img 
                src="/logo.png" 
                alt="ChoosePure" 
                className="h-24 sm:h-32 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-gray-400">
              India's first parent-led community that tests food for purity. Together, we ensure every child eats pure.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-green-400 transition-colors text-sm">Home</Link></li>
              <li><Link to="/reports" className="hover:text-green-400 transition-colors text-sm">Test Reports</Link></li>
              <li><Link to="/blog" className="hover:text-green-400 transition-colors text-sm">Blog</Link></li>
              <li><Link to="/dashboard" className="hover:text-green-400 transition-colors text-sm">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-green-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-green-400 transition-colors text-sm">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-green-400 transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-green-400 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-green-400 transition-colors text-sm">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-green-400 transition-colors text-sm">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm sm:text-base">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail size={16} className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm">contact@choosepure.in</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone size={16} className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm">+91 9876543210</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="text-green-400 mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Mumbai, Maharashtra, India</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="https://youtube.com" className="text-gray-400 hover:text-red-500 transition-colors">
                <Youtube size={18} />
              </a>
              <a href="https://facebook.com" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-pink-500 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            © {new Date().getFullYear()} ChoosePure. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            A movement by responsible parents for safer food.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
