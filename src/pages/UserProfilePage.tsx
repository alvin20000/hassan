import React from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, User, Mail, Calendar, Phone, MapPin, Star, Eye } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';

const UserProfilePage: React.FC = () => {
  const { user, isAuthenticated, getUserOrders, logout } = useUserAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [showOrderModal, setShowOrderModal] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const userOrders = await getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    if (!isAuthenticated) {
      navigate('/');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { 
        label: 'Pending', 
        color: 'text-yellow-600 dark:text-yellow-400', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: Clock,
        description: 'Your order is being reviewed'
      },
      confirmed: { 
        label: 'Confirmed', 
        color: 'text-blue-600 dark:text-blue-400', 
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        icon: CheckCircle,
        description: 'Order confirmed and being prepared'
      },
      processing: { 
        label: 'Processing', 
        color: 'text-purple-600 dark:text-purple-400', 
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        icon: Package,
        description: 'Your order is being processed'
      },
      shipped: { 
        label: 'Shipped', 
        color: 'text-indigo-600 dark:text-indigo-400', 
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        icon: Truck,
        description: 'Order is on the way'
      },
      delivered: { 
        label: 'Delivered', 
        color: 'text-green-600 dark:text-green-400', 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle,
        description: 'Order successfully delivered'
      },
      cancelled: { 
        label: 'Cancelled', 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: XCircle,
        description: 'Order has been cancelled'
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    
    return { totalOrders, totalSpent, pendingOrders, completedOrders };
  };

  if (!isAuthenticated && !showAuthModal) {
    return null;
  }

  const stats = getOrderStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Store</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account and track orders</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      {isAuthenticated && user ? (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Profile Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name}</h2>
                <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-600 dark:text-blue-400" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalOrders}</p>
                    <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Total Orders</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedOrders}</p>
                    <p className="text-sm text-green-600/70 dark:text-green-400/70">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingOrders}</p>
                    <p className="text-sm text-yellow-600/70 dark:text-yellow-400/70">Pending</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Star className="text-purple-600 dark:text-purple-400" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.totalSpent)}</p>
                    <p className="text-sm text-purple-600/70 dark:text-purple-400/70">Total Spent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
              <button
                onClick={loadOrders}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
            
            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start shopping to see your orders here!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${statusInfo.bgColor}`}>
                            <StatusIcon className={statusInfo.color} size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Order #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white text-lg">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${statusInfo.color} font-medium`}>
                            {statusInfo.description}
                          </p>
                          {order.order_items && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order #{selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center gap-4">
                {(() => {
                  const statusInfo = getStatusInfo(selectedOrder.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`p-4 rounded-xl ${statusInfo.bgColor} flex items-center gap-3`}>
                      <StatusIcon className={statusInfo.color} size={24} />
                      <div>
                        <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</p>
                        <p className={`text-sm ${statusInfo.color}/70`}>{statusInfo.description}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.products?.name || `Product ${item.product_id}`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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