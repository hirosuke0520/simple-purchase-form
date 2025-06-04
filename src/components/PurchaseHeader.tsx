import React from 'react';
import { ShoppingBag } from 'lucide-react';

const PurchaseHeader: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <ShoppingBag className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
      <p className="text-gray-600">Fill in your details to complete the purchase.</p>
    </header>
  );
};

export default PurchaseHeader;