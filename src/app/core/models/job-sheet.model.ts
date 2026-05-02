import { Customer } from './customer.model';

export type JobStatus =
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'AWAITING_PARTS'
  | 'IN_REPAIR'
  | 'READY'
  | 'DELIVERED';

export interface JobSheet {
  id?: number;
  jobNumber?: string;
  customer: Customer;
  deviceType?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  problemDescription?: string;
  accessories?: string;
  technician?: string;
  estimatedCost?: number;
  finalCost?: number;
  status: JobStatus;
  notes?: string;
  receivedDate?: string;
  deliveryDate?: string;
  deliveredDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalJobs: number;
  received: number;
  diagnosing: number;
  awaitingParts: number;
  inRepair: number;
  pendingJobs: number;
  readyForPickup: number;
  delivered: number;
  deliveredToday: number;
  totalRevenue: number;
  recentJobs: JobSheet[];
}

export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: 'RECEIVED',       label: 'Received' },
  { value: 'DIAGNOSING',     label: 'Diagnosing' },
  { value: 'AWAITING_PARTS', label: 'Awaiting Parts' },
  { value: 'IN_REPAIR',      label: 'In Repair' },
  { value: 'READY',          label: 'Ready for Pickup' },
  { value: 'DELIVERED',      label: 'Delivered' },
];
