import { PurchasesPackage } from '@revenuecat/purchases-js';

export interface RevenueCatProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number; // price in cents
  currency: string;
  interval?: string | null;
  offeringId: string;
  revenueCatPackage: PurchasesPackage;
}

export interface RevenueCatConfig {
  enabled: boolean;
  publicKey?: string;
}