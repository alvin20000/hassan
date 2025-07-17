import React, { useState } from 'react';
import { PROMOTIONS } from '../mocks/data';
import { ShoppingBag, Clock, Tag, Filter, Star, ArrowRight, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const PromotionsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const filteredPromotions = activeFilter
    ? PROMOTIONS.filter(promo => promo.applicable === activeFilter)
    : PROMOTIONS;

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= now && now <= end;
  };

  const handleShopNow = (promo: any) => {
    // Navigate to home page with filter or add to cart
    navigate('/');
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 dark:from-primary/10 dark:via-secondary/5 dark:to-accent/10 rounded-3xl p-8 md:p-12 mb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <Percent className="text-primary" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Special Offers
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
            Discover amazing deals and exclusive discounts on your favorite food items
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={16} />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-green-500" size={16} />
              <span>Limited Time</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="text-blue-500" size={16} />
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <Filter className="text-gray-600 dark:text-gray-300" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filter Promotions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: null, label: 'All Promotions', icon: '🎯' },
            { key: 'all', label: 'All Products', icon: '🛍️' },
            { key: 'category', label: 'Category Specific', icon: '📂' },
            { key: 'product', label: 'Product Specific', icon: '🎁' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeFilter === filter.key
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPromotions.map(promo => {
          const daysLeft = getDaysRemaining(promo.endDate);
          const isPromoActive = isActive(promo.startDate, promo.endDate);
          
          return (
            <div key={promo.id} className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
              {/* Image Section */}
              {promo.image && (
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={promo.image} 
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      {promo.discount}% OFF
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isPromoActive ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/90 backdrop-blur-sm text-white rounded-2xl text-sm font-semibold shadow-lg">
                        <Clock size={16} />
                        {daysLeft} days left
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-500/90 backdrop-blur-sm text-white rounded-2xl text-sm font-semibold shadow-lg">
                        <Clock size={16} />
                        {new Date(promo.startDate) > new Date() ? 'Coming Soon' : 'Expired'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Content Section */}
              <div className="p-6">
                {/* Title and Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {promo.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {promo.description}
                  </p>
                </div>
                
                {/* Promo Code */}
                {promo.code && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-2xl mb-6 border-2 border-dashed border-gray-300 dark:border-gray-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-primary" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Promo Code:</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-bold text-primary font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded-lg">
                        {promo.code}
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(promo.code)}
                        className="text-xs bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Min. purchase:</span>
                    <br />
                    <span className="text-primary font-bold">UGX {promo.minimumPurchase?.toLocaleString()}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleShopNow(promo)}
                    className="group/btn flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingBag size={18} />
                    <span>Shop Now</span>
                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPromotions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Promotions Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            No promotions match your selected filter. Try selecting a different category.
          </p>
          <button
            onClick={() => setActiveFilter(null)}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-colors"
          >
            View All Promotions
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;