import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesInvoice } from '../models/sales-invoice.model';

@Injectable({ providedIn: 'root' })
export class SalesInvoiceService {
  private apiUrl = 'http://localhost:8080/api/invoices';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SalesInvoice[]> {
    return this.http.get<SalesInvoice[]>(this.apiUrl);
  }

  getById(id: number): Observable<SalesInvoice> {
    return this.http.get<SalesInvoice>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<SalesInvoice> {
    return this.http.post<SalesInvoice>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<SalesInvoice> {
    return this.http.put<SalesInvoice>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
