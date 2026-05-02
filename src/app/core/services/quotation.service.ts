import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { Product } from './product.service';

export interface QuotationItem {
  id?: number;
  product: Product;
  quantity: number;
  rate: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Quotation {
  id?: number;
  customer: Customer;
  createdAt?: string;
  updatedAt?: string;
  validityTerms: string;
  paymentTerms: string;
  specificTerms: string;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  items: QuotationItem[];
}

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private readonly API = 'http://localhost:8080/api/quotations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(this.API);
  }

  getById(id: number): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.API}/${id}`);
  }

  create(quotation: Quotation): Observable<Quotation> {
    return this.http.post<Quotation>(this.API, quotation);
  }

  update(id: number, quotation: Quotation): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.API}/${id}`, quotation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
