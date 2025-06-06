export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number; // price in smallest currency unit
  currency: string; // currency code
  interval?: string | null; // for subscription interval
}