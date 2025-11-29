
export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_APPLICABLE = 'NA',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface EquipmentItem {
  id: string;
  projectNumber: string; // 計畫編號
  name: string; // 設備品項
  approvedQuantity: number; // 核定數量 (New)
  unit: string; // 單位 (New)
  startStatus: string; // 開始狀態
  estimatedCost: number; // 估計費用
  deanApproval: Status; // 院長核準 (Red/Green)
  committeeApproval: Status; // 經策會核準 (<300萬不適用)
  signatureComplete: boolean; // 簽呈完備
  requisitionSent: boolean; // 請購單送出
  procurementProcess: Status; // 採購作業
}

export interface DashboardMetrics {
  totalItems: number;
  totalCost: number;
  completedItems: number;
  avgProgress: number;
  approvedCost: number;
  balance: number;
}
