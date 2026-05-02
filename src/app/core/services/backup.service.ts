import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly API = 'http://localhost:8080/api/backup';

  constructor(private http: HttpClient) { }

  downloadBackup(): Observable<Blob> {
    return this.http.get(`${this.API}/download`, {
      responseType: 'blob'
    });
  }

  restoreBackup(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.API}/restore`, formData, {
      responseType: 'text'
    });
  }
}
