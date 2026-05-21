import { Supplier } from './supplier.model';
import { Product } from '../services/product.service';

export interface PurchaseItem {
  id?: number;
  productId?: number;
  product?: Product;
  quantity: number;
  rate: number;
  discount: number;
  taxableValue?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount?: number;
}

export interface PurchaseInvoice {
  id?: number;
  invoiceNumber: string;
  supplierId?: number;
  supplier?: Supplier;
  invoiceDate: string;
  notes?: string;
  status: 'RECEIVED' | 'CANCELLED';
  items: PurchaseItem[];
  totalTaxableValue?: number;
  totalCgst?: number;
  totalSgst?: number;
  totalIgst?: number;
  grandTotal?: number;
}
