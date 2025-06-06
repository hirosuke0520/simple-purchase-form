import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCurrentOfferings, convertRevenueCatPackageToProduct, purchasePackage } from '../lib/revenuecat';
import { RevenueCatProduct } from '../types/revenuecat';
import { formatPrice } from '../lib/utils';
import { Loader2, AlertCircle, ArrowLeft, RefreshCw, Crown, CheckCircle2 } from 'lucide-react';
import Button from './ui/Button';

const RevenueCatProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<RevenueCatProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const loadProduct = async () => {
    if (!productId) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading RevenueCat product:', productId);
      
      const currentOffering = await getCurrentOfferings();
      
      if (!currentOffering) {
        setError('No offerings available');
        return;
      }

      const packageFound = currentOffering.availablePackages.find(pkg => pkg.identifier === productId);
      
      if (!packageFound) {
        setError('Product not found');
        return;
      }

      const revenueCatProduct = convertRevenueCatPackageToProduct(packageFound, currentOffering.identifier);
      setProduct(revenueCatProduct);
    } catch (err: any) {
      console.error('Failed to load RevenueCat product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handlePurchase = async () => {
    if (!product) return;

    try {
      setPurchasing(true);
      setError(null);
      
      console.log('Purchasing RevenueCat package:', product.revenueCatPackage);
      
      const result = await purchasePackage(product.revenueCatPackage);
      console.log('Purchase successful:', result);
      
      setPurchaseSuccess(true);
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setError(err.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRetry = () => {
    loadProduct();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-md">
          <div className="mb-6">
            <Link 
              to="/revenuecat" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>

          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-purple-100 p-3">
                <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Loading Product
              </h2>
              <p className="text-gray-600">
                Fetching product details from RevenueCat...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-md">
          <div className="mb-6">
            <Link 
              to="/revenuecat" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>

          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                {error === 'Product not found' ? 'Product Not Found' : 'Failed to Load Product'}
              </h2>
              <p className="mb-6 text-gray-600 text-sm">
                {error || 'The requested product could not be found.'}
              </p>
              <div className="flex gap-3">
                <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                <Link to="/revenuecat">
                  <Button>
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-md">
          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Purchase Successful!
              </h2>
              <p className="mb-6 text-gray-600">
                Thank you for your subscription to {product.name}. You now have access to all premium features.
              </p>
              <div className="space-y-3 w-full">
                <Link to="/revenuecat">
                  <Button className="w-full">
                    View All Products
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setPurchaseSuccess(false)}
                  className="w-full"
                >
                  Make Another Purchase
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-md">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            to="/revenuecat" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>

        <div className="animate-fadeIn">
          {/* Header */}
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Your Subscription</h1>
            <p className="text-gray-600">Subscribe to unlock premium features.</p>
          </header>

          {/* Product Card */}
          <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="mt-1 text-purple-100">{product.description}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-bold">{formatPrice(product.price, product.currency)}</p>
                {product.mode === 'subscription' && product.interval && (
                  <span className="text-purple-200 text-sm">
                    per {product.interval}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  isLoading={purchasing}
                >
                  <Crown className="h-5 w-5" />
                  {product.mode === 'subscription' ? 'Subscribe' : 'Purchase'} {formatPrice(product.price, product.currency)}
                </Button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Your subscription will be processed securely via RevenueCat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCatProductDetail;