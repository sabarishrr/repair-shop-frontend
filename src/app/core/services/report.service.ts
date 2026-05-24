import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportSummaryResponse } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports/summary';

  constructor(private http: HttpClient) {}

  getReportSummary(startDate: string, endDate: string): Observable<ReportSummaryResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ReportSummaryResponse>(this.apiUrl, { params });
  }
}
