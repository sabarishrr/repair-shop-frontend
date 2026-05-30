import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = 'http://localhost:8080/api/suppliers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  getActive(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl, { params: { activeOnly: 'true' } });
  }

  toggleActive(id: number): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  create(data: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, data);
  }

  update(id: number, data: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
