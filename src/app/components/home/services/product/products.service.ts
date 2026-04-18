import { Injectable } from '@angular/core';
import { Product } from '../../types/products.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../../../../api-url';
import { filter, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly baseURL = `${API_BASE_URL}/products`;
  constructor(private http: HttpClient) {}

  getAllProducts(filters?: {
    maincategoryid?: number;
    subcategoryid?: number;
    keyword?: string;
  }): Observable<Product[]> {
    let params = new HttpParams();

    if (filters?.maincategoryid != null) {
      params = params.set('maincategoryid', filters.maincategoryid.toString());
    }
    if (filters?.subcategoryid != null) {
      params = params.set('subcategoryid', filters.subcategoryid.toString());
    }
    if (filters?.keyword) {
      params = params.set('keyword', filters.keyword);
    }

    return this.http.get<Product[]>(this.baseURL, { params });
  }
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseURL}/${id}`);
  }

  getHotDeals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/hot-deals`);
  }
}
