import React from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UserProfile from '../components/user/UserProfile';
import AuthModal from '../components/auth/AuthModal';

const UserProfilePage: React.FC = () => {
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleAuthClose = () => {
    setShowAuthModal(false);
    if (!isAuthenticated) {
      navigate('/');
    }
  };

  if (!isAuthenticated && !showAuthModal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Store</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      {isAuthenticated ? (
        <div className="max-w-7xl mx-auto px-4">
          <UserProfile />
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to view your profile and order history.
            </p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
      />
    </div>
  );
};

export default UserProfilePage;