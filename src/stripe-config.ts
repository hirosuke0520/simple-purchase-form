export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const products: StripeProduct[] = [
  {
    id: 'prod_SR80TPbaetgBbb',
    priceId: 'price_1RWFk5D7DUEtdvlGKe3pwPVm',
    name: 'テスト商品',
    description: 'これはテストの商品です。',
    mode: 'payment',
  },
];