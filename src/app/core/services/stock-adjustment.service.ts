import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockAdjustment } from '../models/stock-adjustment.model';

@Injectable({ providedIn: 'root' })
export class StockAdjustmentService {
  private readonly API = 'http://localhost:8080/api/stock-adjustments';

  constructor(private http: HttpClient) {}

  getAll(): Observable<StockAdjustment[]> {
    return this.http.get<StockAdjustment[]>(this.API);
  }

  create(adjustment: Partial<StockAdjustment>): Observable<StockAdjustment> {
    return this.http.post<StockAdjustment>(this.API, adjustment);
  }
}
