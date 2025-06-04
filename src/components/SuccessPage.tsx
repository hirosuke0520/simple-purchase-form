import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from './ui/Button';

const SuccessPage: React.FC = () => {
  return (
    <div className="animate-fadeIn rounded-lg bg-white p-8 shadow-lg">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-green-100 p-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        
        <p className="mb-6 text-gray-600">
          Thank you for your purchase. We've sent you an email with your order details.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            If you have any questions about your order, please don't hesitate to contact our support team.
          </p>
          
          <Link to="/">
            <Button className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;