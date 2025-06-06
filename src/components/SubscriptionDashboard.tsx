import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../stripe-config";
import { StripeProduct } from "../types/stripe";
import { formatPrice } from "../lib/utils";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Calendar,
  Zap,
} from "lucide-react";
import Button from "./ui/Button";

const SubscriptionDashboard: React.FC = () => {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading subscription products...");

      const fetchedProducts = await getProducts();
      // Filter for subscription items only
      const subscriptionProducts = fetchedProducts.filter(product => product.mode === 'subscription');
      setProducts(subscriptionProducts);

      if (subscriptionProducts.length === 0) {
        setError("No subscription products available");
      }
    } catch (err: any) {
      console.error("Failed to load subscription products:", err);
      setError(err.message || "Failed to load subscription products");
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
              <div className="mb-4 rounded-full bg-purple-100 p-3">
                <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Loading Subscriptions
              </h2>
              <p className="text-gray-600">
                Fetching available subscription plans...
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
                Failed to Load Subscriptions
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
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
            <CreditCard className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Subscription Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Recurring subscriptions with ongoing value and premium features.
          </p>
          
          {/* Navigation */}
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Single Items
              </Button>
            </Link>
            <div className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium">
              Subscriptions
            </div>
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
                No Subscription Plans Available
              </h2>
              <p className="mb-6 text-gray-600 text-sm">
                No subscription products are currently available.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Link to="/">
                  <Button variant="outline">
                    View Single Items
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
                className="animate-fadeIn overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative"
              >
                {/* Popular badge for first subscription */}
                {products.indexOf(product) === 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      <Zap className="h-3 w-3 inline mr-1" />
                      POPULAR
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.interval && (
                      <span className="text-purple-200 text-sm">
                        per {product.interval}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6 min-h-[3rem]">
                    {product.description ||
                      "Premium subscription with ongoing benefits and exclusive features."}
                  </p>

                  {/* Subscription benefits */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Recurring {product.interval || 'monthly'} billing</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Zap className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Subscription Plan
                    </div>
                    <Link to={`/${product.id}`}>
                      <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                        Subscribe
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscription Benefits Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Subscriptions?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Continuous Value
              </h3>
              <p className="text-gray-600 text-sm">
                Get ongoing updates, new features, and premium support throughout your subscription.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Flexible Billing
              </h3>
              <p className="text-gray-600 text-sm">
                Choose monthly or yearly plans. Cancel or change your subscription anytime.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Secure Payments
              </h3>
              <p className="text-gray-600 text-sm">
                All payments are processed securely through Stripe with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Flexible Billing</span>
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
                <Zap className="h-4 w-4" />
                <span className="text-sm">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;