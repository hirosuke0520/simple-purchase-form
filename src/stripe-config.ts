export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const products: StripeProduct[] = [
  {
    id: import.meta.env.VITE_STRIPE_PRODUCT_ID || '',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
    name: 'Premium Package',
    description: 'Get access to all premium features',
    mode: 'payment',
  },
];