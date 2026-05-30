import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly API = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<Customer[]> {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<Customer[]>(this.API, { params });
  }

  getActive(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.API, { params: new HttpParams().set('activeOnly', 'true') });
  }

  toggleActive(id: number): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API}/${id}/toggle-active`, {});
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.API}/${id}`);
  }

  create(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.API, customer);
  }

  update(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.API}/${id}`, customer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
