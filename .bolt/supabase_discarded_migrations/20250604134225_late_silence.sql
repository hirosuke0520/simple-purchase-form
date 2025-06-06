/*
  # Update Stripe Checkout Session Function
  
  1. Changes
    - Enable HTTP extension if not already enabled
    - Drop existing checkout session function
    - Recreate function with proper Stripe API integration
  
  2. Security
    - Function runs with SECURITY DEFINER
    - Uses proper parameter types
    - Includes error handling
*/

-- Enable the http extension
CREATE EXTENSION IF NOT EXISTS "http";

-- Drop the existing function
DROP FUNCTION IF EXISTS create_checkout_session(text, text, text, text, text);

-- Recreate the create_checkout_session function with proper error handling
CREATE OR REPLACE FUNCTION create_checkout_session(
  price_id TEXT,
  success_url TEXT,
  cancel_url TEXT,
  mode TEXT,
  customer_email TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stripe_secret_key TEXT;
  stripe_url TEXT := 'https://api.stripe.com/v1/checkout/sessions';
  response json;
BEGIN
  -- Get the Stripe secret key from your secure storage/vault
  SELECT current_setting('stripe.secret_key') INTO stripe_secret_key;
  
  -- Make the HTTP POST request to Stripe
  SELECT content::json INTO response
  FROM http_post(
    stripe_url,
    ARRAY[
      ('Authorization', 'Bearer ' || stripe_secret_key),
      ('Content-Type', 'application/x-www-form-urlencoded')
    ],
    ARRAY[
      ('price', price_id),
      ('success_url', success_url),
      ('cancel_url', cancel_url),
      ('mode', mode),
      ('customer_email', customer_email)
    ]
  );
  
  RETURN response;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;