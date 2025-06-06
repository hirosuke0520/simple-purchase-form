import { loadStripe } from '@stripe/stripe-js';
import type { StripeProduct } from './types/stripe';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
    // Check if we have the required environment variables
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not found');
      return;
    }

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      console.warn('Stripe publishable key not found');
      return;
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.products?.length > 0) {
      const product = data.products[0];
      const defaultPrice = product.default_price;
      
      products[0] = {
        id: product.id,
        priceId: typeof defaultPrice === 'string' ? defaultPrice : defaultPrice?.id || '',
        name: product.name,
        description: product.description || 'Get access to all premium features',
        mode: 'payment',
      };
      
      console.log('Stripe products loaded successfully:', products[0]);
    } else {
      console.warn('No products found in Stripe');
    }
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    // Set fallback product data if API fails
    products[0] = {
      id: 'fallback',
      priceId: 'price_fallback',
      name: 'Premium Package',
      description: 'Get access to all premium features',
      mode: 'payment',
    };
  }
}

export { stripePromise };