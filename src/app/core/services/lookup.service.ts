import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Brand { id?: number; name: string; }
export interface CommonIssue { id?: number; issue: string; }

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly API = 'http://localhost:8080/api/lookups';

  constructor(private http: HttpClient) {}

  getBrands(): Observable<Brand[]> { return this.http.get<Brand[]>(`${this.API}/brands`); }
  createBrand(brand: Brand): Observable<Brand> { return this.http.post<Brand>(`${this.API}/brands`, brand); }


  getIssues(): Observable<CommonIssue[]> { return this.http.get<CommonIssue[]>(`${this.API}/issues`); }
  createIssue(issue: CommonIssue): Observable<CommonIssue> { return this.http.post<CommonIssue>(`${this.API}/issues`, issue); }
}
