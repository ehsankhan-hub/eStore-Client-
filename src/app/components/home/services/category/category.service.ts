import { Injectable } from '@angular/core';
import { Category } from '../../types/category';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../../api-url';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/productCategories`);
  }
}
