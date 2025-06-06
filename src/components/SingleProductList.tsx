import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../stripe-config";
import { StripeProduct } from "../types/stripe";
import { formatPrice } from "../lib/utils";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import Button from "./ui/Button";

const SingleProductList: React.FC = () => {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading single purchase products...");

      const fetchedProducts = await getProducts();
      // Filter for single purchase items only
      const singleProducts = fetchedProducts.filter(product => product.mode === 'payment');
      setProducts(singleProducts);

      if (singleProducts.length === 0) {
        setError("No single purchase products available");
      }
    } catch (err: any) {
      console.error("Failed to load products:", err);
      setError(err.message || "Failed to load products");
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
                Fetching available single purchase items...
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
              <p className="mb-6 text-gray-600 text-sm">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <ShoppingBag className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Single Purchase Items
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            One-time purchases with instant access. No recurring charges.
          </p>
          
          {/* Navigation */}
          <div className="mt-8 flex justify-center gap-4">
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
              Single Items
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                View Subscriptions
              </Button>
            </Link>
          </div>
        </header>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-yellow-100 p-3">
                <AlertCircle className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                No Single Purchase Items Available
              </h2>
              <p className="mb-6 text-gray-600 text-sm">
                No one-time purchase products are currently available.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Link to="/dashboard">
                  <Button variant="outline">
                    View Subscriptions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="animate-fadeIn overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    <span className="text-green-200 text-sm">
                      one-time
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6 min-h-[3rem]">
                    {product.description ||
                      "Premium product with instant access and lifetime value."}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Single Purchase
                    </div>
                    <Link to={`/${product.id}`}>
                      <Button className="flex items-center gap-2">
                        Buy Now
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
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm">Instant Access</span>
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
                <span className="text-sm">No Recurring Charges</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SingleProductList;