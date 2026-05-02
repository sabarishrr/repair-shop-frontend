import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface State {
  id: number;
  name: string;
  gstCode: string;
}

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly API = 'http://localhost:8080/api/states';

  constructor(private http: HttpClient) {}

  getAll(): Observable<State[]> {
    return this.http.get<State[]>(this.API);
  }
}
