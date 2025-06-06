import { useEffect, useState } from 'react';
import { initRevenueCat, getCurrentOfferings, purchasePackage } from '../lib/revenuecat';

interface Package {
  identifier: string;
  rcBillingProduct: {
    currentPrice: {
      currency: string;
      amount: number;
      amountMicros: number;
      formatted: string;
    };
    title: string;
    description: string;
    subscriptionPeriod: string;
  };
}

interface Offering {
  identifier: string;
  availablePackages: Package[];
}

const Dashboard = () => {
  const [offerings, setOfferings] = useState<{ current?: Offering } | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupRevenueCat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // RevenueCatを初期化
        await initRevenueCat();
        
        // 商品一覧を取得
        const currentOfferings = await getCurrentOfferings();
        setOfferings(currentOfferings);
      } catch (err) {
        console.error('Setup failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    setupRevenueCat();
  }, []);

  const handlePurchase = async (pkg: Package) => {
    try {
      setPurchasing(pkg.identifier);
      setError(null);
      
      const result = await purchasePackage(pkg);
      console.log('Purchase result:', result);
      
      // 購入成功後の処理
      alert('サブスクリプションの購入が完了しました！');
    } catch (err) {
      console.error('Purchase failed:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">RevenueCatを初期化中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">イベントオーナー向けダッシュボード</h1>
          <p className="text-gray-600">プランを選択して、イベント作成機能を利用開始しましょう</p>
        </header>

        {!offerings?.current?.availablePackages?.length ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">商品が見つかりません</h3>
            <p className="text-gray-600 mb-4">
              RevenueCatのダッシュボードで商品とOfferingsを設定してください
            </p>
            <a 
              href="https://app.revenuecat.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              RevenueCat Dashboardを開く
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {offerings.current.availablePackages.map((pkg) => (
              <div key={pkg.identifier} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {pkg.rcBillingProduct.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {pkg.rcBillingProduct.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {pkg.rcBillingProduct.currentPrice.formatted}
                  </div>
                  <div className="text-sm text-gray-500">
                    {pkg.rcBillingProduct.subscriptionPeriod}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.identifier}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {purchasing === pkg.identifier ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      処理中...
                    </span>
                  ) : (
                    'このプランで始める'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">開発者向け情報</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>RevenueCat API Key:</strong> {import.meta.env.VITE_REVENUECAT_PUBLIC_KEY ? '設定済み' : '未設定'}</p>
            <p><strong>利用可能なOfferings:</strong> {offerings?.current ? '1個' : '0個'}</p>
            <p><strong>利用可能なPackages:</strong> {offerings?.current?.availablePackages?.length || 0}個</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
