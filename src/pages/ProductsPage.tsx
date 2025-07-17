import React, { useState, useEffect } from 'react';
import { useProducts, useCategories } from '../hooks/useDatabase';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Filter, Search, MessageCircle, Phone } from 'lucide-react';
import { getProductImageUrl } from '../lib/supabase';

const ProductsPage: React.FC = () => {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get popular products (featured ones)
  const popularProducts = products.filter(product => product.featured);

  const handleOrder = (product: any) => {
    addItem(product, 1);
    navigate('/cart');
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '256741068782';
    const message = 'Hello! I need help choosing the right food products.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/20 rounded-2xl">
            <ShoppingBag className="text-primary" size={32} />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Select Your Food Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose your preferred food products to see the best retail prices in Uganda
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Popular Products Section */}
      {popularProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Star className="text-orange-500" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Products</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 cursor-pointer"
                onClick={() => handleOrder(product)}
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={getProductImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Premium Quality
                  </p>
                  <p className="text-primary font-bold text-sm">
                    UGX {product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Filter className="text-blue-500" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Categories</h2>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* All Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-12">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 cursor-pointer group"
            onClick={() => handleOrder(product)}
          >
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <img
                  src={getProductImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {product.unit}
              </p>
              <p className="text-primary font-bold text-sm">
                UGX {product.price.toLocaleString()}
              </p>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {product.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Products Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            No products match your search criteria. Try adjusting your filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            View All Products
          </button>
        </div>
      )}

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 rounded-3xl p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/20 rounded-2xl">
            <ShoppingBag className="text-primary" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Select Your Food Products Above
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          Choose your preferred food products to see the best retail prices in Uganda.
        </p>
        
        {/* Help Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Need Help? Contact Our Food Experts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Our food experts are here to help you get the best food retail prices in Uganda.
          </p>
          <button
            onClick={handleWhatsAppContact}
            className="w-full bg-[#25D366] text-white py-3 rounded-xl font-semibold hover:bg-[#25D366]/90 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            WhatsApp: +256 741 068 782
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;