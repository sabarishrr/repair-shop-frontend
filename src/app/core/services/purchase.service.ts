import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseInvoice } from '../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = 'http://localhost:8080/api/purchases';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseInvoice[]> {
    return this.http.get<PurchaseInvoice[]>(this.apiUrl);
  }

  getById(id: number): Observable<PurchaseInvoice> {
    return this.http.get<PurchaseInvoice>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<PurchaseInvoice> {
    return this.http.post<PurchaseInvoice>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<PurchaseInvoice> {
    return this.http.put<PurchaseInvoice>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
