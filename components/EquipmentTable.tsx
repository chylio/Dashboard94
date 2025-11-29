
import React from 'react';
import { EquipmentItem, Status } from '../types';
import StatusBadge from './StatusBadge';
import { THRESHOLD_COMMITTEE_APPROVAL } from '../constants';

interface EquipmentTableProps {
  items: EquipmentItem[];
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({ items }) => {
  const calculateProgress = (item: EquipmentItem): number => {
    let steps = 0;
    let completed = 0;

    // 1. Dean Approval
    steps++;
    if (item.deanApproval === Status.APPROVED) completed++;
    
    // 2. Committee Approval (Dynamic)
    if (item.estimatedCost >= THRESHOLD_COMMITTEE_APPROVAL) {
      steps++;
      if (item.committeeApproval === Status.APPROVED) completed++;
    }

    // 3. Signature
    steps++;
    if (item.signatureComplete) completed++;

    // 4. Requisition
    steps++;
    if (item.requisitionSent) completed++;

    // 5. Procurement
    steps++;
    if (item.procurementProcess === Status.COMPLETED) completed++;

    return Math.round((completed / steps) * 100);
  };

  const formatCurrency = (val: number) => {
    if (isNaN(val)) return '$0';
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(val);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200 text-center text-gray-500">
        目前沒有資料，請使用上方「快速貼上」或「上傳檔案」功能。
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">計畫編號</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設備名稱</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">數量</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">單位</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預估費用</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">院長核准</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">經策會 {'>'} 300萬</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">簽呈完備</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">請購單送出</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">採購作業</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總進度</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const progress = calculateProgress(item);
              const isCommitteeNeeded = item.estimatedCost >= THRESHOLD_COMMITTEE_APPROVAL;

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 font-mono sticky left-0 bg-white z-10 border-r border-gray-100 shadow-sm">
                    {item.projectNumber || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{item.name || "未命名"}</span>
                      <span className="text-xs text-gray-500">{item.startStatus || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-mono">
                    {item.approvedQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {formatCurrency(item.estimatedCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.deanApproval} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={isCommitteeNeeded ? item.committeeApproval : Status.NOT_APPLICABLE} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.signatureComplete} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.requisitionSent} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <StatusBadge status={item.procurementProcess} type="text" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentTable;
