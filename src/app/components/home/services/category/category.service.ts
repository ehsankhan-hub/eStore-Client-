import { Injectable } from '@angular/core';
import { Category } from '../../types/category';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5004/api/productCategories'
      : 'http://192.168.1.21:5004/api/productCategories';
    return this.http.get<Category[]>(baseURL);
  }
}
