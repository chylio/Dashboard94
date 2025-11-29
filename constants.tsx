
import { EquipmentItem, Status } from './types';
import { CheckCircle, XCircle, Clock, MinusCircle } from 'lucide-react';
import React from 'react';

export const INITIAL_DATA: EquipmentItem[] = [
  {
    id: '1',
    projectNumber: '113-A001',
    name: '高解析度 MRI 掃描儀',
    approvedQuantity: 1,
    unit: '台',
    startStatus: '新申請',
    estimatedCost: 15000000,
    deanApproval: Status.APPROVED,
    committeeApproval: Status.PENDING,
    signatureComplete: false,
    requisitionSent: false,
    procurementProcess: Status.PENDING
  },
  {
    id: '2',
    projectNumber: '113-B012',
    name: '實驗室離心機 X 型',
    approvedQuantity: 2,
    unit: '台',
    startStatus: '汰舊換新',
    estimatedCost: 250000,
    deanApproval: Status.APPROVED,
    committeeApproval: Status.NOT_APPLICABLE,
    signatureComplete: true,
    requisitionSent: true,
    procurementProcess: Status.IN_PROGRESS
  },
  {
    id: '3',
    projectNumber: '113-C005',
    name: '達文西手術機械手臂',
    approvedQuantity: 1,
    unit: '套',
    startStatus: '新申請',
    estimatedCost: 5500000,
    deanApproval: Status.REJECTED,
    committeeApproval: Status.NOT_APPLICABLE,
    signatureComplete: false,
    requisitionSent: false,
    procurementProcess: Status.PENDING
  },
  {
    id: '4',
    projectNumber: '113-A008',
    name: '病患生理監測系統',
    approvedQuantity: 10,
    unit: '組',
    startStatus: '升級',
    estimatedCost: 4200000,
    deanApproval: Status.APPROVED,
    committeeApproval: Status.APPROVED,
    signatureComplete: true,
    requisitionSent: true,
    procurementProcess: Status.COMPLETED
  },
  {
    id: '5',
    projectNumber: '113-D022',
    name: '手提式超音波',
    approvedQuantity: 3,
    unit: '台',
    startStatus: '汰舊換新',
    estimatedCost: 1200000,
    deanApproval: Status.PENDING,
    committeeApproval: Status.NOT_APPLICABLE,
    signatureComplete: false,
    requisitionSent: false,
    procurementProcess: Status.PENDING
  }
];

export const STATUS_ICONS = {
  [Status.APPROVED]: <CheckCircle className="w-5 h-5 text-green-500" />,
  [Status.COMPLETED]: <CheckCircle className="w-5 h-5 text-green-500" />,
  [Status.REJECTED]: <XCircle className="w-5 h-5 text-red-500" />,
  [Status.PENDING]: <Clock className="w-5 h-5 text-yellow-500" />,
  [Status.IN_PROGRESS]: <Clock className="w-5 h-5 text-blue-500" />,
  [Status.NOT_APPLICABLE]: <MinusCircle className="w-5 h-5 text-gray-300" />
};

export const THRESHOLD_COMMITTEE_APPROVAL = 3000000;
