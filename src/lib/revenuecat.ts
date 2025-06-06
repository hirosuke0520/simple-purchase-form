import Purchases, { PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-js';

let isInitialized = false;

// RevenueCat initialization
export const initRevenueCat = async (userId?: string): Promise<void> => {
  if (isInitialized) {
    return;
  }

  try {
    const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
    if (!apiKey) {
      throw new Error('RevenueCat API key not found. Please set VITE_REVENUECAT_PUBLIC_KEY in your environment variables.');
    }

    await Purchases.configure({
      apiKey,
      appUserId: userId || undefined, // Let RevenueCat generate anonymous ID if no userId provided
    });

    isInitialized = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};

// Get current offerings (products)
export const getCurrentOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    if (!isInitialized) {
      await initRevenueCat();
    }

    const offerings = await Purchases.getOfferings();
    console.log('RevenueCat offerings:', offerings);
    
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    throw error;
  }
};

// Purchase a package
export const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
  try {
    if (!isInitialized) {
      await initRevenueCat();
    }

    const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
    console.log('Purchase successful:', { purchaserInfo, productIdentifier });
    return { purchaserInfo, productIdentifier };
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
};

// Get current user info
export const getCurrentUserInfo = async () => {
  try {
    if (!isInitialized) {
      await initRevenueCat();
    }

    const purchaserInfo = await Purchases.getPurchaserInfo();
    console.log('Current purchaser info:', purchaserInfo);
    return purchaserInfo;
  } catch (error) {
    console.error('Failed to get purchaser info:', error);
    throw error;
  }
};

// Restore purchases
export const restorePurchases = async () => {
  try {
    if (!isInitialized) {
      await initRevenueCat();
    }

    const purchaserInfo = await Purchases.restorePurchases();
    console.log('Purchases restored:', purchaserInfo);
    return purchaserInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

// Convert RevenueCat package to our StripeProduct format for compatibility
export const convertRevenueCatPackageToProduct = (pkg: PurchasesPackage, offeringId: string) => {
  const product = pkg.rcBillingProduct;
  
  return {
    id: pkg.identifier,
    priceId: pkg.identifier, // Use package identifier as price ID
    name: product.title,
    description: product.description || 'Premium subscription package',
    mode: product.subscriptionPeriod ? 'subscription' : 'payment',
    price: product.currentPrice.amountMicros / 10000, // Convert micros to cents
    currency: product.currentPrice.currency.toLowerCase(),
    interval: product.subscriptionPeriod || null,
    offeringId,
    revenueCatPackage: pkg, // Store original package for purchasing
  };
};