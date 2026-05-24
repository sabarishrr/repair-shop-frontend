import { Product } from '../services/product.service';

export interface StockAdjustment {
  id?: number;
  product: Product;
  adjustmentType: 'ADD' | 'SUBTRACT';
  quantity: number;
  reason: 'PHYSICAL_COUNT' | 'DAMAGED' | 'LOST' | 'FOUND' | 'REPARATION' | 'OTHER';
  notes?: string;
  adjustmentDate?: string;
  createdBy?: string;
  createdAt?: string;
}
