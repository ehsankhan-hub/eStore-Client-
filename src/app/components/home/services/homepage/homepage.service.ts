import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../../api-url';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  private readonly baseURL = `${API_BASE_URL}/homepage`;

  constructor(private http: HttpClient) {}

  getHomepageBlocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/public`);
  }
}
