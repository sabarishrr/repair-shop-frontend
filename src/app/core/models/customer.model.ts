import { State } from '../services/state.service';

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  state?: State;
  createdAt?: string;
}
