/*
  # Initial Stripe Integration Schema

  1. Tables
    - stripe_customers: Links users to Stripe customers
    - stripe_subscriptions: Tracks subscription data
    - stripe_orders: Stores order information

  2. Views
    - stripe_user_subscriptions: User subscription data
    - stripe_user_orders: User order history

  3. Functions
    - create_checkout_session: Creates Stripe checkout sessions via Edge Functions
*/

-- Create enum types
CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
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
    'canceled'
);

-- Create tables
CREATE TABLE IF NOT EXISTS stripe_customers (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
    customer_id text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz DEFAULT null
);

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_id text UNIQUE NOT NULL,
    subscription_id text DEFAULT null,
    price_id text DEFAULT null,
    current_period_start bigint DEFAULT null,
    current_period_end bigint DEFAULT null,
    cancel_at_period_end boolean DEFAULT false,
    payment_method_brand text DEFAULT null,
    payment_method_last4 text DEFAULT null,
    status stripe_subscription_status NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz DEFAULT null
);

CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    checkout_session_id text NOT NULL,
    payment_intent_id text NOT NULL,
    customer_id text NOT NULL,
    amount_subtotal bigint NOT NULL,
    amount_total bigint NOT NULL,
    currency text NOT NULL,
    payment_status text NOT NULL,
    status stripe_order_status NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz DEFAULT null
);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Create views
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

CREATE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;

-- Grant permissions
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;

-- Create checkout session function
CREATE OR REPLACE FUNCTION create_checkout_session(
    price_id text,
    success_url text,
    cancel_url text,
    mode text DEFAULT 'payment',
    customer_email text DEFAULT null
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    response json;
    edge_function_url text;
    supabase_anon_key text;
BEGIN
    -- Get the Edge Function URL and anon key from your environment variables
    edge_function_url := current_setting('app.settings.edge_function_url', true);
    supabase_anon_key := current_setting('app.settings.anon_key', true);
    
    -- Call the Edge Function
    SELECT content::json INTO response
    FROM http((
        'POST',
        edge_function_url || '/stripe-checkout',
        ARRAY[http_header('Authorization', 'Bearer ' || supabase_anon_key)],
        'application/json',
        json_build_object(
            'price_id', price_id,
            'success_url', success_url,
            'cancel_url', cancel_url,
            'mode', mode,
            'customer_email', customer_email
        )::text
    )::http_request);

    RETURN response;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create checkout session: %', SQLERRM;
END;
$$;

-- Grant function execution permission
GRANT EXECUTE ON FUNCTION create_checkout_session TO authenticated;