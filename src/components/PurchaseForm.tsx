import React, { useState, FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { validateEmail, validateName, formatPrice } from "../lib/utils";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { products } from "../stripe-config";

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
  productName: string;
  productPrice: number;
  productDescription: string;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PurchaseForm: React.FC<PurchaseFormProps> = ({
  productName,
  productPrice,
  productDescription,
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
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const product = products[0];

      console.log("Starting guest checkout with product:", product);
      console.log("Customer data:", {
        name: formData.name,
        email: formData.email,
      });

      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price: product.priceId,
            quantity: 1,
          },
        ],
        mode: product.mode,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
        customerEmail: formData.email,
        billingAddressCollection: "required",
        shippingAddressCollection: {
          allowedCountries: ["JP", "US"],
        },
      });

      if (error) {
        throw new Error(`Stripe checkout error: ${error.message}`);
      }

      console.log("Checkout redirect initiated successfully");
    } catch (error: any) {
      console.error("Payment failed:", error);
      setPaymentStatus(PaymentStatus.ERROR);

      let errorMsg =
        error.message ||
        "支払い処理中にエラーが発生しました。もう一度お試しください。";

      if (errorMsg.includes("Failed to fetch")) {
        errorMsg =
          "ネットワークエラーが発生しました。インターネット接続を確認してください。";
      } else if (errorMsg.includes("Stripe")) {
        errorMsg =
          "決済システムエラーが発生しました。しばらく時間をおいてからお試しください。";
      }

      setErrorMessage(errorMsg);
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
            Payment Failed
          </h2>
          <p className="mb-6 text-gray-600">{errorMessage}</p>
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
        <h2 className="text-2xl font-bold">{productName}</h2>
        <p className="mt-1 text-blue-100">{productDescription}</p>
        <p className="mt-4 text-3xl font-bold">{formatPrice(productPrice)}</p>
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
            Pay {formatPrice(productPrice)}
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
