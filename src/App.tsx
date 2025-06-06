import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PurchaseForm from './components/PurchaseForm';
import PurchaseHeader from './components/PurchaseHeader';
import PurchaseFooter from './components/PurchaseFooter';
import SuccessPage from './components/SuccessPage';
import { getProducts, isStripeLoading } from './stripe-config';
import { StripeProduct } from './types/stripe';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Button from './components/ui/Button';

function App() {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading products...');
      
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      
      if (fetchedProducts.length === 0) {
        setError('No products available');
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
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
        <div className="mx-auto max-w-md">
          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Loading Products
              </h2>
              <p className="text-gray-600">
                Fetching the latest products from Stripe...
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
        <div className="mx-auto max-w-md">
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
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the primary product (first product)
  const primaryProduct = products[0];

  if (!primaryProduct) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-md">
          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-yellow-100 p-3">
                <AlertCircle className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                No Products Available
              </h2>
              <p className="mb-6 text-gray-600 text-sm">
                No products are currently available for purchase.
              </p>
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-md">
        <Routes>
          <Route
            path="/"
            element={
              <div className="animate-fadeIn">
                <PurchaseHeader />
                <PurchaseForm
                  productName={primaryProduct.name}
                  productPrice={primaryProduct.price}
                  productDescription={primaryProduct.description}
                  product={primaryProduct}
                />
                <PurchaseFooter />
              </div>
            }
          />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;