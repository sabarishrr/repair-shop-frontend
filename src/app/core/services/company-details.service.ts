import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { State } from './state.service';

export interface CompanyDetails {
  id?: number;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  gstNumber?: string;
  state?: State;
  bankName?: string;
  accountNumber?: string;
  branchIfsCode?: string;
  upiId?: string;
  nextInvoiceNo?: number;
  nextReceiptNo?: number;
  nextPaymentNo?: number;
  nextCreditNoteNo?: number;
  nextDebitNoteNo?: number;
  invoicePrefix?: string;
  receiptPrefix?: string;
  paymentPrefix?: string;
  creditNotePrefix?: string;
  debitNotePrefix?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyDetailsService {
  private readonly API = 'http://localhost:8080/api/company';

  constructor(private http: HttpClient) {}

  get(): Observable<CompanyDetails> {
    return this.http.get<CompanyDetails>(this.API);
  }

  update(details: CompanyDetails): Observable<CompanyDetails> {
    return this.http.put<CompanyDetails>(this.API, details);
  }
}
