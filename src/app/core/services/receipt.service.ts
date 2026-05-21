import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Receipt } from '../models/receipt.model';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private apiUrl = 'http://localhost:8080/api/receipts';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(this.apiUrl);
  }

  getById(id: number): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<Receipt> {
    return this.http.post<Receipt>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Receipt> {
    return this.http.put<Receipt>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
