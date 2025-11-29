import React from 'react';
import { DollarSign, ClipboardList, Activity, CheckSquare, FileCheck, Wallet } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* 1. Total Items */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-blue-50 rounded-full mr-4">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">設備總數</p>
          <h3 className="text-2xl font-bold text-gray-800">{metrics.totalItems}</h3>
        </div>
      </div>

      {/* 2. Total Cost */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-gray-100 rounded-full mr-4">
          <DollarSign className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">總預估費用</p>
          <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(metrics.totalCost)}</h3>
        </div>
      </div>

      {/* 3. Dean Approved Cost (New) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-emerald-50 rounded-full mr-4">
          <FileCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">院長已核准金額</p>
          <h3 className="text-2xl font-bold text-emerald-700">{formatCurrency(metrics.approvedCost)}</h3>
        </div>
      </div>

      {/* 4. Balance (New) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className={`p-3 rounded-full mr-4 ${metrics.balance < 0 ? 'bg-red-50' : 'bg-sky-50'}`}>
          <Wallet className={`w-6 h-6 ${metrics.balance < 0 ? 'text-red-600' : 'text-sky-600'}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">未核准餘額</p>
          <h3 className={`text-2xl font-bold ${metrics.balance < 0 ? 'text-red-600' : 'text-sky-600'}`}>
            {formatCurrency(metrics.balance)}
          </h3>
        </div>
      </div>

      {/* 5. Completed Items */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-purple-50 rounded-full mr-4">
          <CheckSquare className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">已完成項目</p>
          <h3 className="text-2xl font-bold text-gray-800">{metrics.completedItems} / {metrics.totalItems}</h3>
        </div>
      </div>

      {/* 6. Avg Progress */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className="p-3 bg-orange-50 rounded-full mr-4">
          <Activity className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">平均進度</p>
          <h3 className="text-2xl font-bold text-gray-800">{metrics.avgProgress.toFixed(0)}%</h3>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;
