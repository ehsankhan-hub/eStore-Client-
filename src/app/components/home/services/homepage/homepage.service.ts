import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  private readonly baseURL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5004/api/homepage'
    : 'https://short-coats-dig.loca.lt/api/homepage';

  constructor(private http: HttpClient) {}

  getHomepageBlocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/public`);
  }
}
