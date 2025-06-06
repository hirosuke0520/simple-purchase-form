-- Drop the existing function
DROP FUNCTION IF EXISTS create_checkout_session(text, text, text, text, text);

-- Enable HTTP extension for making requests to Edge Functions
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Recreate the function to use Edge Function
CREATE OR REPLACE FUNCTION public.create_checkout_session(
    price_id text,
    success_url text,
    cancel_url text,
    mode text,
    customer_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    edge_function_url text;
    request_body jsonb;
    response_body jsonb;
    response_status int;
BEGIN
    -- Get the project URL from the current request
    edge_function_url := rtrim(current_setting('request.headers')::json->>'origin', '/') || '/functions/v1/stripe-checkout';
    
    -- Build the request body
    request_body := jsonb_build_object(
        'price_id', price_id,
        'success_url', success_url,
        'cancel_url', cancel_url,
        'mode', mode,
        'customer_email', customer_email
    );

    -- Make HTTP POST request to the Edge Function
    SELECT
        status, content::jsonb
    INTO
        response_status, response_body
    FROM
        extensions.http_post(
            url := edge_function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true)
            ),
            body := request_body
        );

    -- Return the response or raise an error
    IF response_status = 200 THEN
        RETURN response_body;
    ELSE
        RAISE EXCEPTION 'Edge function call failed with status %: %', response_status, response_body;
    END IF;
END;
$$;