/*
  # Create Stripe Integration Functions

  1. New Functions
    - create_checkout_session: Creates a Stripe checkout session through Edge Functions
    
  2. Changes
    - Creates PostgreSQL function for checkout session creation
*/

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
  response json;
  edge_function_url text;
  supabase_anon_key text;
begin
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

  return response;
exception
  when others then
    raise exception 'Failed to create checkout session: %', SQLERRM;
end;
$$;

-- Grant access to the authenticated users
grant execute on function create_checkout_session to authenticated;