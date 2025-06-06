import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Supabase Stripe Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders,
      });
    }

    const { 
      price_id, 
      success_url, 
      cancel_url, 
      mode = 'payment',
      customer_email,
      user_id 
    } = await req.json();

    if (!price_id) {
      throw new Error('Price ID is required');
    }

    let customerId: string | undefined;

    // If we have customer email, try to find or create a Stripe customer
    if (customer_email) {
      // Check if customer already exists in Stripe
      const existingCustomers = await stripe.customers.list({
        email: customer_email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: customer_email,
        });
        customerId = customer.id;

        // Store customer in our database if user_id is provided
        if (user_id) {
          await supabase.from('stripe_customers').upsert({
            user_id,
            customer_id: customerId,
            email: customer_email,
          });
        }
      }
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: mode as 'payment' | 'subscription',
      success_url,
      cancel_url,
      metadata: {
        user_id: user_id || '',
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customer_email) {
      sessionParams.customer_email = customer_email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        checkout_url: session.url,
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});