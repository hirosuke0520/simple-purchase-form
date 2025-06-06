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

    // Mock Stripe products data for development
    // In production, you would fetch this from Stripe API
    const products = [
      {
        id: "prod_premium",
        name: "Premium Package",
        description: "Get access to all premium features",
        default_price: "price_premium_monthly",
        active: true,
        metadata: {},
      }
    ];

    const responseData = {
      products: products,
      success: true,
    };

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in stripe-products function:", error);
    
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