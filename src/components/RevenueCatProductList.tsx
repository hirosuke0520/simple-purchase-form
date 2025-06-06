import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentOfferings, convertRevenueCatPackageToProduct } from '../lib/revenuecat';
import { RevenueCatProduct } from '../types/revenuecat';
import { formatPrice } from '../lib/utils';
import { Loader2, AlertCircle, RefreshCw, ShoppingBag, ArrowRight, Crown } from 'lucide-react';
import Button from './ui/Button';

const RevenueCatProductList: React.FC = () => {
  const [products, setProducts] = useState<RevenueCatProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading RevenueCat products...');
      
      const currentOffering = await getCurrentOfferings();
      
      if (!currentOffering || !currentOffering.availablePackages.length) {
        setError('No products available from RevenueCat');
        setProducts([]);
        return;
      }

      const revenueCatProducts = currentOffering.availablePackages.map(pkg => 
        convertRevenueCatPackageToProduct(pkg, currentOffering.identifier)
      );
      
      setProducts(revenueCatProducts);
      console.log('RevenueCat products loaded:', revenueCatProducts);
    } catch (err: any) {
      console.error('Failed to load RevenueCat products:', err);
      setError(err.message || 'Failed to load products from RevenueCat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRetry = () => {
    loadProducts();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Loading Products
              </h2>
              <p className="text-gray-600">
                Fetching the latest products from RevenueCat...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Failed to Load Products
              </h2>
              <p className="mb-6 text-gray-600 text-sm">
                {error}
              </p>
              <div className="space-y-3">
                <Button onClick={handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                <p className="text-xs text-gray-500">
                  Make sure VITE_REVENUECAT_PUBLIC_KEY is set in your environment variables
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
            <Crown className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Premium Subscriptions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our premium subscription plans powered by RevenueCat.
          </p>
        </header>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-yellow-100 p-3">
                <AlertCircle className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                No Products Available
              </h2>
              <p className="mb-6 text-gray-600 text-sm">
                No subscription products are currently available.
              </p>
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="animate-fadeIn overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.mode === 'subscription' && product.interval && (
                      <span className="text-purple-200 text-sm">
                        per {product.interval}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6 min-h-[3rem]">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {product.mode === 'subscription' ? 'Subscription' : 'One-time'}
                      </span>
                    </div>
                    <Link to={`/revenuecat/${product.id}`}>
                      <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        {product.mode === 'subscription' ? 'Subscribe' : 'Buy Now'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600">
                <Crown className="h-4 w-4" />
                <span className="text-sm">Premium Quality</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Secure Payments</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RevenueCatProductList;