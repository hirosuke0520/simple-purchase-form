/*
  # Stripe Integration Schema

  1. New Tables
    - `stripe_customers`: Links users to Stripe customers
    - `stripe_subscriptions`: Tracks subscription status and details
    - `stripe_orders`: Records one-time payments and order details

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
*/

-- Create enum types for status tracking
CREATE TYPE stripe_subscription_status AS ENUM (
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused'
);

CREATE TYPE stripe_order_status AS ENUM (
  'pending',
  'completed',
  'canceled',
  'refunded'
);

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  email text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  subscription_id text NOT NULL UNIQUE,
  price_id text NOT NULL,
  product_id text NOT NULL,
  status stripe_subscription_status NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = auth.uid()
    )
  );

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  checkout_session_id text NOT NULL UNIQUE,
  payment_intent_id text,
  amount_total bigint NOT NULL,
  amount_subtotal bigint NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status stripe_order_status NOT NULL DEFAULT 'pending',
  payment_status text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON stripe_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON stripe_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id ON stripe_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_checkout_session_id ON stripe_orders(checkout_session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_stripe_customers_updated_at 
  BEFORE UPDATE ON stripe_customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at 
  BEFORE UPDATE ON stripe_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_orders_updated_at 
  BEFORE UPDATE ON stripe_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();