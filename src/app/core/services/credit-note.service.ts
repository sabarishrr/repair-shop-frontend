import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreditNote } from '../models/credit-note.model';

@Injectable({ providedIn: 'root' })
export class CreditNoteService {
  private apiUrl = 'http://localhost:8080/api/credit-notes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CreditNote[]> {
    return this.http.get<CreditNote[]>(this.apiUrl);
  }

  getById(id: number): Observable<CreditNote> {
    return this.http.get<CreditNote>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<CreditNote> {
    return this.http.post<CreditNote>(this.apiUrl, data);
  }

  cancel(id: number): Observable<CreditNote> {
    return this.http.post<CreditNote>(`${this.apiUrl}/${id}/cancel`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
