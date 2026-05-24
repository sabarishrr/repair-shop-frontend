import { Supplier } from './supplier.model';
import { PurchaseInvoice } from './purchase.model';

export interface DebitNoteItem {
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

export interface DebitNote {
  id?: number;
  noteNumber: string;
  noteDate: string;
  purchaseInvoiceId?: number;
  purchaseInvoice?: PurchaseInvoice;
  supplierId: number;
  supplier?: Supplier;
  items: DebitNoteItem[];
  totalTaxableValue?: number;
  totalCgst?: number;
  totalSgst?: number;
  totalIgst?: number;
  grandTotal?: number;
  reason: 'PURCHASE_RETURN' | 'PRICE_CORRECTION' | 'CORRECTION_IN_INVOICE' | 'OTHER';
  status: 'ACTIVE' | 'CANCELLED';
  notes?: string;
}
