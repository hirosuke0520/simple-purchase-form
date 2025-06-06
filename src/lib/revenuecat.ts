import Purchases from '@revenuecat/purchases-js';

// RevenueCatの初期化
export const initRevenueCat = async (userId?: string) => {
  try {
    await Purchases.configure({
      apiKey: import.meta.env.VITE_REVENUECAT_PUBLIC_KEY,
      appUserId: userId || 'anonymous', // 認証なしの場合はanonymous
    });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};

// 現在のOfferingsを取得
export const getCurrentOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    console.log('Current offerings:', offerings);
    return offerings;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    throw error;
  }
};

// パッケージを購入
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
    console.log('Purchase successful:', { purchaserInfo, productIdentifier });
    return { purchaserInfo, productIdentifier };
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
};

// 現在のサブスクリプション情報を取得
export const getCurrentUserInfo = async () => {
  try {
    const purchaserInfo = await Purchases.getPurchaserInfo();
    console.log('Current purchaser info:', purchaserInfo);
    return purchaserInfo;
  } catch (error) {
    console.error('Failed to get purchaser info:', error);
    throw error;
  }
};

// サブスクリプションの復元
export const restorePurchases = async () => {
  try {
    const purchaserInfo = await Purchases.restorePurchases();
    console.log('Purchases restored:', purchaserInfo);
    return purchaserInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};
