import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
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

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { 
        status: 400 
      });
    }

    // Handle the event asynchronously
    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  console.log(`Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    throw error;
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { customer, mode, payment_status, amount_total, amount_subtotal, currency } = session;
  
  if (!customer || typeof customer !== 'string') {
    console.error('No customer found in checkout session');
    return;
  }

  // Ensure customer exists in our database
  const stripeCustomer = await stripe.customers.retrieve(customer) as Stripe.Customer;
  await upsertCustomer(stripeCustomer);

  if (mode === 'payment' && payment_status === 'paid') {
    // Handle one-time payment
    await supabase.from('stripe_orders').insert({
      customer_id: customer,
      checkout_session_id: session.id,
      payment_intent_id: session.payment_intent as string,
      amount_total: amount_total || 0,
      amount_subtotal: amount_subtotal || 0,
      currency: currency || 'usd',
      status: 'completed',
      payment_status: payment_status,
    });
    
    console.log(`One-time payment completed for customer: ${customer}`);
  } else if (mode === 'subscription') {
    // Subscription will be handled by subscription events
    console.log(`Subscription checkout completed for customer: ${customer}`);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const { customer, id, status, items, current_period_start, current_period_end, cancel_at_period_end, canceled_at, trial_start, trial_end } = subscription;
  
  if (typeof customer !== 'string') {
    console.error('Invalid customer in subscription');
    return;
  }

  const price = items.data[0]?.price;
  if (!price) {
    console.error('No price found in subscription');
    return;
  }

  await supabase.from('stripe_subscriptions').upsert({
    customer_id: customer,
    subscription_id: id,
    price_id: price.id,
    product_id: price.product as string,
    status: status as any,
    current_period_start: new Date(current_period_start * 1000).toISOString(),
    current_period_end: new Date(current_period_end * 1000).toISOString(),
    cancel_at_period_end,
    canceled_at: canceled_at ? new Date(canceled_at * 1000).toISOString() : null,
    trial_start: trial_start ? new Date(trial_start * 1000).toISOString() : null,
    trial_end: trial_end ? new Date(trial_end * 1000).toISOString() : null,
  }, {
    onConflict: 'subscription_id'
  });

  console.log(`Subscription ${status} for customer: ${customer}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Invoice payment succeeded: ${invoice.id}`);
  // Handle successful subscription payment
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Invoice payment failed: ${invoice.id}`);
  // Handle failed subscription payment
}

async function upsertCustomer(customer: Stripe.Customer) {
  const { error } = await supabase.from('stripe_customers').upsert({
    customer_id: customer.id,
    email: customer.email!,
    name: customer.name,
  }, {
    onConflict: 'customer_id'
  });

  if (error) {
    console.error('Error upserting customer:', error);
  }
}