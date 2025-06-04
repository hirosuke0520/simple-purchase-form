/*
  # Create Stripe Integration Functions

  1. New Functions
    - create_checkout_session: Creates a Stripe checkout session
    
  2. Changes
    - Adds Stripe extension wrapper
    - Creates PostgreSQL function for checkout session creation
*/

-- Enable the Stripe extension
create extension if not exists wrappers with schema extensions;
create extension if not exists stripe with schema extensions;

-- Create the function to handle checkout session creation
create or replace function create_checkout_session(
  price_id text,
  success_url text,
  cancel_url text,
  mode text default 'payment',
  customer_email text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  checkout_session json;
begin
  select
    stripe.create_checkout_session(
      json_build_object(
        'success_url', success_url,
        'cancel_url', cancel_url,
        'mode', mode,
        'line_items', json_build_array(
          json_build_object(
            'price', price_id,
            'quantity', 1
          )
        ),
        'customer_email', customer_email
      )
    )
  into checkout_session;

  return json_build_object(
    'checkout_url', checkout_session->>'url'
  );
end;
$$;

-- Grant access to the authenticated users
grant execute on function create_checkout_session to authenticated;