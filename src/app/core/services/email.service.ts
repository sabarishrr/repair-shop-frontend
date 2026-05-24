import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailRequest {
  toEmail: string;
  subject: string;
  message: string;
  documentType: string;  // 'INVOICE' | 'QUOTATION' | 'RECEIPT' | 'PAYMENT' | 'JOBSHEET'
  documentId: number;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private apiUrl = 'http://localhost:8080/api/email/send';

  constructor(private http: HttpClient) {}

  sendEmail(request: EmailRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, request);
  }
}
