import React from 'react';
import PurchaseForm from './components/PurchaseForm';
import PurchaseHeader from './components/PurchaseHeader';
import PurchaseFooter from './components/PurchaseFooter';
import { products } from './stripe-config';

function App() {
  const product = products[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-md">
        <div className="animate-fadeIn">
          <PurchaseHeader />
          
          <PurchaseForm 
            productName={product.name}
            productPrice={5000}
            productDescription={product.description}
          />
          
          <PurchaseFooter />
        </div>
      </div>
    </div>
  );
}

export default App;