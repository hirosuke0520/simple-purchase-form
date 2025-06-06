const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Price ID is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Mock checkout session for development
    // In production, you would create a real Stripe checkout session
    const mockCheckoutSession = {
      id: "cs_mock_" + Math.random().toString(36).substr(2, 9),
      url: successUrl || "http://localhost:5173/success",
      payment_status: "unpaid",
      mode: "payment",
    };

    return new Response(
      JSON.stringify({
        sessionId: mockCheckoutSession.id,
        url: mockCheckoutSession.url,
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in stripe-checkout function:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});