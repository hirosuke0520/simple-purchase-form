import React from 'react';
import { Shield, Lock, CreditCard } from 'lucide-react';

const PurchaseFooter: React.FC = () => {
  return (
    <footer className="mt-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Secure Checkout</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Protected Payment</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">Secure Transaction</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PurchaseFooter;