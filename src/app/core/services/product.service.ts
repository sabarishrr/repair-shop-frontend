import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  rate: number;
  hsn?: string;
  gstPercentage: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.API, { params: search ? { search } : {} });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API}/${id}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.API, product);
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.API}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
