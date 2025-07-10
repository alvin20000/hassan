import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Package, Calendar, DollarSign, Edit, Save, X, Loader2 } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';

const UserProfile: React.FC = () => {
  const { user, updateProfile, getUserOrders, logout } = useUserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        phone: user.phone || '',
        address: user.address || ''
      });
      loadOrders();
    }
  }, [user]);

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

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
    setError('');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="text-gray-400" size={20} />
                <span className="text-gray-900 dark:text-white">{user.full_name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Mail className="text-gray-400" size={20} />
              <span className="text-gray-900 dark:text-white">{user.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+256 XXX XXX XXX"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Phone className="text-gray-400" size={20} />
                <span className="text-gray-900 dark:text-white">{user.phone || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Member Since
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Calendar className="text-gray-400" size={20} />
              <span className="text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            {isEditing ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <MapPin className="text-gray-400 mt-0.5" size={20} />
                <span className="text-gray-900 dark:text-white">{user.address || 'Not provided'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order History</h2>
        
        {ordersLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
            <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 dark:text-gray-400">No orders found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start shopping to see your orders here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Items ({order.order_items.length}):
                    </p>
                    <div className="space-y-2">
                      {order.order_items.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900 dark:text-white">
                            {item.products?.name || `Product ${item.product_id}`} × {item.quantity}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatCurrency(item.total_price)}
                          </span>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          +{order.order_items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;