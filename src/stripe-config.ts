import { loadStripe } from '@stripe/stripe-js';
import type { StripeProduct } from './types/stripe';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const products: StripeProduct[] = [
  {
    id: 'default',
    priceId: '',
    name: 'Premium Package',
    description: 'Get access to all premium features',
    mode: 'payment',
  },
];

export async function initializeStripe() {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Stripe products');
    }

    const data = await response.json();
    if (data.products?.[0]) {
      products[0] = {
        id: data.products[0].id,
        priceId: data.products[0].default_price,
        name: data.products[0].name,
        description: data.products[0].description || 'Get access to all premium features',
        mode: 'payment',
      };
    }
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
  }
}

export { stripePromise };