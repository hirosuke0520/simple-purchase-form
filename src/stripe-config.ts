import { loadStripe } from '@stripe/stripe-js';
import type { StripeProduct } from './types/stripe';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Start with empty products array
let products: StripeProduct[] = [];
let isInitialized = false;
let isLoading = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeStripe(): Promise<void> {
  // Return existing promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  // Return immediately if already initialized
  if (isInitialized) {
    return;
  }

  isLoading = true;
  
  initializationPromise = (async () => {
    try {
      console.log('Initializing Stripe products...');
      
      // Check if we have the required environment variables
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase environment variables not found');
      }

      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Stripe publishable key not found');
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
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      if (data.products && data.products.length > 0) {
        // Transform Stripe API response to internal StripeProduct format
        products = data.products.map((product: any) => {
          const defaultPrice = product.default_price;
          
          // Handle both string and object price references
          const priceId = typeof defaultPrice === 'string' ? defaultPrice : defaultPrice?.id || '';
          const priceAmount = typeof defaultPrice === 'object' ? defaultPrice?.unit_amount || 0 : 0;
          const currency = typeof defaultPrice === 'object' ? defaultPrice?.currency || 'usd' : 'usd';
          const priceType = typeof defaultPrice === 'object' ? defaultPrice?.type : 'one_time';
          const interval = typeof defaultPrice === 'object' ? defaultPrice?.recurring?.interval : null;
          
          return {
            id: product.id,
            priceId,
            name: product.name,
            description: product.description || 'Get access to all premium features',
            mode: priceType === 'recurring' ? 'subscription' : 'payment',
            price: priceAmount,
            currency,
            interval: priceType === 'recurring' ? interval : null,
          } as StripeProduct;
        });
        
        console.log('Stripe products loaded successfully:', products);
      } else {
        console.warn('No products found in Stripe');
        // Set fallback product if no products found
        products = [{
          id: 'fallback',
          priceId: 'price_fallback',
          name: 'Premium Package',
          description: 'Get access to all premium features',
          mode: 'payment',
          price: 5000, // $50.00
          currency: 'usd',
          interval: null,
        }];
      }
      
      isInitialized = true;
    } catch (error) {
      console.error('Error fetching Stripe products:', error);
      
      // Set fallback product data if API fails
      products = [{
        id: 'fallback',
        priceId: 'price_fallback',
        name: 'Premium Package',
        description: 'Get access to all premium features',
        mode: 'payment',
        price: 5000, // $50.00
        currency: 'usd',
        interval: null,
      }];
      
      // Don't mark as initialized on error so retry is possible
      throw error;
    } finally {
      isLoading = false;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

export async function getProducts(): Promise<StripeProduct[]> {
  // Ensure initialization
  if (!isInitialized && !isLoading) {
    await initializeStripe();
  } else if (isLoading && initializationPromise) {
    await initializationPromise;
  }
  
  return products;
}

export async function getProductById(id: string): Promise<StripeProduct | null> {
  const allProducts = await getProducts();
  return allProducts.find(product => product.id === id) || null;
}

export function isStripeLoading(): boolean {
  return isLoading;
}

export function isStripeInitialized(): boolean {
  return isInitialized;
}

export { stripePromise };