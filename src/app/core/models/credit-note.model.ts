import { Customer } from './customer.model';
import { SalesInvoice } from './sales-invoice.model';

export interface CreditNoteItem {
  id?: number;
  productId?: number;
  description?: string;
  hsn?: string;
  quantity: number;
  unitPrice: number;
  gstPercentage?: number;
  taxableValue?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount?: number;
}

export interface CreditNote {
  id?: number;
  noteNumber: string;
  noteDate: string;
  salesInvoiceId?: number;
  salesInvoice?: SalesInvoice;
  customerId: number;
  customer?: Customer;
  items: CreditNoteItem[];
  totalTaxableValue?: number;
  totalCgst?: number;
  totalSgst?: number;
  totalIgst?: number;
  grandTotal?: number;
  reason: 'SALES_RETURN' | 'POST_SALES_DISCOUNT' | 'CORRECTION_IN_INVOICE' | 'OTHER';
  status: 'ACTIVE' | 'CANCELLED';
  notes?: string;
}
