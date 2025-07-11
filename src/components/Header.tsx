import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Dumbbell } from 'lucide-react';
import AuthModal from './AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Programs', href: '#programs' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleJoinNow = () => {
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button onClick={handleLogoClick} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Dumbbell className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">FitZone</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium"
              >
                {item.name}
              </button>
            ))}
          </nav>

          <button 
            onClick={handleJoinNow}
            className="hidden md:block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
          >
            Sign Up / Sign In
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="block w-full text-left py-2 text-gray-700 hover:text-orange-500 transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}
            <button 
              onClick={handleJoinNow}
              className="w-full bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium mt-4"
            >
              Sign Up / Sign In
            </button>
          </div>
        )}
      </div>
      </header>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;