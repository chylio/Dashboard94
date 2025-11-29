import React from 'react';
import { Status } from '../types';
import { STATUS_ICONS } from '../constants';

interface StatusBadgeProps {
  status: Status | boolean;
  type?: 'light' | 'text'; // 'light' is traffic light style
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'light' }) => {
  // Handle boolean values (for checkboxes like Signature Complete)
  if (typeof status === 'boolean') {
    return (
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${status ? 'bg-green-100' : 'bg-gray-100'}`}>
        {status ? STATUS_ICONS[Status.COMPLETED] : STATUS_ICONS[Status.PENDING]}
      </div>
    );
  }

  if (type === 'light') {
    let bgColor = 'bg-gray-200';
    let ringColor = 'ring-gray-300';
    let title = '';
    
    switch (status) {
      case Status.APPROVED:
      case Status.COMPLETED:
        bgColor = 'bg-green-500';
        ringColor = 'ring-green-300';
        title = '已核准/完成';
        break;
      case Status.REJECTED:
        bgColor = 'bg-red-500';
        ringColor = 'ring-red-300';
        title = '已駁回';
        break;
      case Status.PENDING:
      case Status.IN_PROGRESS:
        bgColor = 'bg-yellow-400';
        ringColor = 'ring-yellow-200';
        title = '待處理/進行中';
        break;
      case Status.NOT_APPLICABLE:
        bgColor = 'bg-gray-300';
        ringColor = 'ring-gray-200';
        title = '不適用';
        break;
    }

    return (
      <div className="flex justify-center items-center" title={title}>
         <div className={`w-4 h-4 rounded-full ${bgColor} ring-4 ${ringColor} opacity-90`}></div>
      </div>
    );
  }

  // Text badge style with Chinese translation
  let badgeClasses = 'bg-gray-100 text-gray-800';
  let label = status as string;

  switch (status) {
    case Status.APPROVED:
      badgeClasses = 'bg-green-100 text-green-800';
      label = '已核准';
      break;
    case Status.COMPLETED:
      badgeClasses = 'bg-green-100 text-green-800';
      label = '已完成';
      break;
    case Status.REJECTED:
      badgeClasses = 'bg-red-100 text-red-800';
      label = '已駁回';
      break;
    case Status.PENDING:
      badgeClasses = 'bg-blue-100 text-blue-800';
      label = '待處理';
      break;
    case Status.IN_PROGRESS:
      badgeClasses = 'bg-blue-100 text-blue-800';
      label = '進行中';
      break;
    case Status.NOT_APPLICABLE:
      badgeClasses = 'bg-gray-200 text-gray-600';
      label = '不適用';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}>
      {label}
    </span>
  );
};

export default StatusBadge;