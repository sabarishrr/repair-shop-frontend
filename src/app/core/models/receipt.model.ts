import { Customer } from './customer.model';
import { SalesInvoice } from './sales-invoice.model';

export interface Receipt {
  id?: number;
  receiptNumber: string;
  receiptDate: string;
  customerId: number;
  customer?: Customer;
  salesInvoiceId?: number;
  salesInvoice?: SalesInvoice;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
