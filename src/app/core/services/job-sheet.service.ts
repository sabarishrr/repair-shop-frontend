import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, JobSheet, JobStatus } from '../models/job-sheet.model';

@Injectable({ providedIn: 'root' })
export class JobSheetService {
  private readonly API = 'http://localhost:8080/api/jobs';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API}/stats`);
  }

  getAll(search?: string, status?: JobStatus): Observable<JobSheet[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<JobSheet[]>(this.API, { params });
  }

  getById(id: number): Observable<JobSheet> {
    return this.http.get<JobSheet>(`${this.API}/${id}`);
  }

  create(job: any): Observable<JobSheet> {
    return this.http.post<JobSheet>(this.API, job);
  }

  update(id: number, job: any): Observable<JobSheet> {
    return this.http.put<JobSheet>(`${this.API}/${id}`, job);
  }

  updateStatus(id: number, status: JobStatus, notes?: string): Observable<JobSheet> {
    return this.http.patch<JobSheet>(`${this.API}/${id}/status`, { status, notes });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
