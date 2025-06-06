import React, { useState, FormEvent } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { validateEmail, validateName, formatPrice } from "../lib/utils";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { StripeProduct } from "../types/stripe";

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

enum PaymentStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
}

interface PurchaseFormProps {
  product: StripeProduct;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({
  product,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    PaymentStatus.IDLE
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateName(formData.name)) {
      newErrors.name = "Please enter a valid name";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setPaymentStatus(PaymentStatus.PROCESSING);

    try {
      if (!product) {
        throw new Error('Product not available');
      }

      // Check if Stripe is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }

      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Stripe is not properly configured. Please check your environment variables.');
      }

      if (!product.priceId || product.priceId === 'price_fallback') {
        throw new Error('Stripe products are not properly configured. Please ensure your Stripe integration is set up correctly.');
      }

      console.log('Creating checkout session for product:', product);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/`,
          mode: product.mode,
          customer_email: formData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.success && data.checkout_url) {
        console.log('Redirecting to Stripe Checkout:', data.checkout_url);
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      setPaymentStatus(PaymentStatus.ERROR);
      setErrorMessage(error.message || "An error occurred during payment processing. Please try again.");
    }
  };

  if (paymentStatus === PaymentStatus.SUCCESS) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-lg transition-all duration-300 animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Payment Successful!
          </h2>
          <p className="mb-6 text-gray-600">
            Thank you for your purchase. A confirmation email has been sent to{" "}
            {formData.email}.
          </p>
          <Button
            onClick={() => {
              setPaymentStatus(PaymentStatus.IDLE);
              setFormData({ name: "", email: "" });
            }}
          >
            Make Another Purchase
          </Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === PaymentStatus.ERROR) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-lg transition-all duration-300 animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Payment Error
          </h2>
          <p className="mb-6 text-gray-600 text-sm">{errorMessage}</p>
          <Button onClick={() => setPaymentStatus(PaymentStatus.IDLE)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="mt-1 text-blue-100">{product.description}</p>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-3xl font-bold">{formatPrice(product.price, product.currency)}</p>
          {product.mode === 'subscription' && product.interval && (
            <span className="text-blue-200 text-sm">
              per {product.interval}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          error={errors.name}
          required
          className="transition-all duration-200 focus:scale-[1.01]"
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          error={errors.email}
          required
          className="transition-all duration-200 focus:scale-[1.01]"
        />

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={paymentStatus === PaymentStatus.PROCESSING}
          >
            <CreditCard className="h-5 w-5" />
            {product.mode === 'subscription' ? 'Subscribe' : 'Pay'} {formatPrice(product.price, product.currency)}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Your payment will be processed securely via Stripe.
        </p>
      </form>
    </div>
  );
};

export default PurchaseForm;