import { Purchases } from "@revenuecat/purchases-js";

let purchasesInstance: any = null;

// RevenueCat initialization
export const initRevenueCat = async (userId?: string): Promise<void> => {
  try {
    const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
    if (!apiKey) {
      throw new Error(
        "RevenueCat API key not found. Please set VITE_REVENUECAT_PUBLIC_KEY in your environment variables."
      );
    }

    // Generate anonymous ID if no userId provided
    const appUserId =
      userId || Purchases.generateRevenueCatAnonymousAppUserId();
    purchasesInstance = Purchases.configure(apiKey, appUserId);

    console.log("RevenueCat initialized successfully");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
    throw error;
  }
};

// Get current offerings (products)
export const getCurrentOfferings = async () => {
  try {
    if (!purchasesInstance) {
      await initRevenueCat();
    }

    const offerings = await Purchases.getSharedInstance().getOfferings();
    console.log("RevenueCat offerings:", offerings);

    return offerings.current;
  } catch (error) {
    console.error("Failed to get offerings:", error);
    throw error;
  }
};

// Purchase a package
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    if (!purchasesInstance) {
      await initRevenueCat();
    }

    const { customerInfo } = await Purchases.getSharedInstance().purchase({
      rcPackage: packageToPurchase,
    });
    console.log("Purchase successful:", customerInfo);
    return customerInfo;
  } catch (error) {
    console.error("Purchase failed:", error);
    throw error;
  }
};

// Get current user info
export const getCurrentUserInfo = async () => {
  try {
    if (!purchasesInstance) {
      await initRevenueCat();
    }

    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    console.log("Current customer info:", customerInfo);
    return customerInfo;
  } catch (error) {
    console.error("Failed to get customer info:", error);
    throw error;
  }
};

// Restore purchases - for Web SDK, this is same as getting customer info
export const restorePurchases = async () => {
  try {
    if (!purchasesInstance) {
      await initRevenueCat();
    }

    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    console.log("Customer info retrieved:", customerInfo);
    return customerInfo;
  } catch (error) {
    console.error("Failed to restore purchases:", error);
    throw error;
  }
};

// Convert RevenueCat package to our StripeProduct format for compatibility
export const convertRevenueCatPackageToProduct = (
  pkg: any,
  offeringId: string
) => {
  const product = pkg.webBillingProduct;

  return {
    id: pkg.identifier,
    priceId: pkg.identifier, // Use package identifier as price ID
    name: product.displayName,
    description: product.description || "Premium subscription package",
    mode: "subscription", // Web Billing is always subscription
    price: product.price.amount, // Price in cents
    currency: product.price.currency.toLowerCase(),
    interval: product.period || null,
    offeringId,
    revenueCatPackage: pkg, // Store original package for purchasing
  };
};
