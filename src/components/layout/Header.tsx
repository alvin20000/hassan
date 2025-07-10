import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, ShoppingBag, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useUserAuth } from '../../context/UserAuthContext';
import AuthModal from '../auth/AuthModal';
import UserProfile from '../user/UserProfile';

const Header: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const { totalItems } = useCart();
  const { user, isAuthenticated } = useUserAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-6 py-2 rounded-full transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white shadow'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-gray-900 shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="M-A General Stores" 
              className="h-10 md:h-14 w-auto"
            />
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-primary">M.A Online Store</h1>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center space-x-4">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/promotions" className={navLinkClass}>Promotions</NavLink>
            <NavLink to="/help" className={navLinkClass}>Help</NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Authentication */}
            {isAuthenticated ? (
              <button
                onClick={() => setShowUserProfile(true)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="User profile"
              >
                <User size={20} />
                <span className="hidden md:inline text-sm font-medium">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}

            <NavLink 
              to="/cart" 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h2>
              <button
                onClick={() => setShowUserProfile(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <UserProfile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;