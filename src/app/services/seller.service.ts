import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Ideally, we'd grab this from an environment file:
const API_URL = 'http://localhost:5004/api/seller'; 

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
}
