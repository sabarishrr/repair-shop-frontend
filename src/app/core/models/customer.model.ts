import { State } from '../services/state.service';

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  companyName?: string;
  gstin?: string;
  state?: State;
  customerType?: string;
  pinCode?: string;
  shippingAddress?: string;
  shippingPinCode?: string;
  active?: boolean;
  createdAt?: string;
}
