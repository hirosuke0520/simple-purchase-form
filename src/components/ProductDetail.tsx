import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../stripe-config';
import { StripeProduct } from '../types/stripe';
import PurchaseHeader from './PurchaseHeader';
import PurchaseForm from './PurchaseForm';
import PurchaseFooter from './PurchaseFooter';
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<StripeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!productId) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading product:', productId);
      
      const fetchedProduct = await getProductById(productId);
      
      if (!fetchedProduct) {
        setError('Product not found');
      } else {
        setProduct(fetchedProduct);
      }
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleRetry = () => {
    loadProduct();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-md">
          {/* Back button */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>

          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Loading Product
              </h2>
              <p className="text-gray-600">
                Fetching product details...
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
          {/* Back button */}
          <div className="mb-6">
            <Link 
              to="/" 
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
                <Link to="/">
                  <Button>
                    Back to Products
                  </Button>
                </Link>
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
            to={product?.mode === 'subscription' ? '/dashboard' : '/'} 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {product?.mode === 'subscription' ? 'Subscriptions' : 'Products'}
          </Link>
        </div>

        <div className="animate-fadeIn">
          <PurchaseHeader />
          <PurchaseForm product={product} />
          <PurchaseFooter />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;