import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-url';

const API_URL = `${API_BASE_URL}/seller`;

@Injectable({
  providedIn: 'root'
})
export class SellerService {

  constructor(private http: HttpClient) {}

  addProduct(productData: FormData): Observable<any> {
    // Passes the native FormData directly to HttpClient, which handles multipart encoding
    return this.http.post(`${API_URL}/product`, productData);
  }

  getProducts(sellerId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/products/${sellerId}`);
  }

  getOffers(sellerId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/offers/${sellerId}`);
  }

  createOffer(offerData: any): Observable<any> {
    return this.http.post(`${API_URL}/offer`, offerData);
  }

  deleteOffer(offerId: number | string): Observable<any> {
    return this.http.delete(`${API_URL}/offer/${offerId}`);
  }

  deleteProduct(productId: number | string): Observable<any> {
    return this.http.delete(`${API_URL}/product/${productId}`);
  }

  updateProduct(productId: number | string, productData: any): Observable<any> {
    return this.http.put(`${API_URL}/product/${productId}`, productData);
  }

  getOrders(sellerId: number | string): Observable<any> {
    return this.http.get<any>(`${API_URL}/orders/${sellerId}`);
  }
}
