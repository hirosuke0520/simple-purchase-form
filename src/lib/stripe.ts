import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface StripeCustomer {
  id: string;
  user_id: string;
  customer_id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface StripeSubscription {
  id: string;
  customer_id: string;
  subscription_id: string;
  price_id: string;
  product_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface StripeOrder {
  id: string;
  customer_id: string;
  checkout_session_id: string;
  payment_intent_id?: string;
  amount_total: number;
  amount_subtotal: number;
  currency: string;
  status: string;
  payment_status?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export async function getCustomerData(userId: string): Promise<StripeCustomer | null> {
  const { data, error } = await supabase
    .from('stripe_customers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching customer data:', error);
    return null;
  }

  return data;
}

export async function getSubscriptions(customerId: string): Promise<StripeSubscription[]> {
  const { data, error } = await supabase
    .from('stripe_subscriptions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return data || [];
}

export async function getOrders(customerId: string): Promise<StripeOrder[]> {
  const { data, error } = await supabase
    .from('stripe_orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

export async function createCheckoutSession(params: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription';
  customerEmail?: string;
  userId?: string;
}) {
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: {
      price_id: params.priceId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      mode: params.mode || 'payment',
      customer_email: params.customerEmail,
      user_id: params.userId,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}