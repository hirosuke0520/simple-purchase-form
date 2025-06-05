import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PurchaseForm from './components/PurchaseForm';
import PurchaseHeader from './components/PurchaseHeader';
import PurchaseFooter from './components/PurchaseFooter';
import SuccessPage from './components/SuccessPage';
import { products } from './stripe-config';

function App() {
  const product = products[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-md">
        {!product.priceId && (
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 mb-4">
            <p>Please set up your Stripe environment variables.</p>
          </div>
        )}
        {!product.priceId && (
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 mb-4">
            <p>Please set up your Stripe environment variables.</p>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <div className="animate-fadeIn">
                <PurchaseHeader />
                <PurchaseForm
                  productName={product.name}
                  productPrice={5000}
                  productDescription={product.description}
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