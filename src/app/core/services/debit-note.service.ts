import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DebitNote } from '../models/debit-note.model';

@Injectable({ providedIn: 'root' })
export class DebitNoteService {
  private apiUrl = 'http://localhost:8080/api/debit-notes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DebitNote[]> {
    return this.http.get<DebitNote[]>(this.apiUrl);
  }

  getById(id: number): Observable<DebitNote> {
    return this.http.get<DebitNote>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<DebitNote> {
    return this.http.post<DebitNote>(this.apiUrl, data);
  }

  cancel(id: number): Observable<DebitNote> {
    return this.http.post<DebitNote>(`${this.apiUrl}/${id}/cancel`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
