import { Customer } from './customer.model';
import { Product } from '../services/product.service';
import { Quotation } from '../services/quotation.service';

export interface SalesInvoiceItem {
  id?: number;
  productId?: number;
  product?: Product;
  description?: string;
  hsn?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstPercentage?: number;
  taxableValue?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount?: number;
}

export interface SalesInvoice {
  id?: number;
  invoiceNumber: string;
  customerId?: number;
  customer?: Customer;
  quotationId?: number;
  quotation?: Quotation;
  invoiceDate: string;
  notes?: string;
  status: 'PAID' | 'UNPAID' | 'CANCELLED';
  salesType?: 'CASH' | 'CREDIT';
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  receivedAmount?: number;
  items: SalesInvoiceItem[];
  totalTaxableValue?: number;
  totalCgst?: number;
  totalSgst?: number;
  totalIgst?: number;
  grandTotal?: number;

  deliveryNote?: string;
  paymentTerms?: string;
  supplierRef?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  despatchDocumentNo?: string;
  deliveryNoteDate?: string;
  despatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
}
