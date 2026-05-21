import { Supplier } from './supplier.model';
import { PurchaseInvoice } from './purchase.model';

export interface Payment {
  id?: number;
  paymentNumber: string;
  paymentDate: string;
  supplierId: number;
  supplier?: Supplier;
  purchaseInvoiceId?: number;
  purchaseInvoice?: PurchaseInvoice;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
