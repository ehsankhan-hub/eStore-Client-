import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, retry, delay } from 'rxjs';
import { CartStoreItem } from '../cart/cart.storeItem';
import {
  Order,
  OrderItem,
  PastOrder,
  PastOrderProduct,
} from '../../types/order.type';
import { DeliveryAddress } from '../../types/cart.type';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private httpClient: HttpClient,
    private cartStore: CartStoreItem,
    private userService: UserService
  ) { }

  // Helper function to safely format price to 2 decimal places
  private formatPrice(price: any): number {
    if (typeof price === 'number') return Math.round(price * 100) / 100;
    if (typeof price === 'string') {
      // Remove currency symbols and commas, then convert to number
      const cleanPrice = price.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleanPrice);
      const numPrice = isNaN(parsed) ? 0 : parsed;
      return Math.round(numPrice * 100) / 100;
    }
    const numPrice = Number(price) || 0;
    return Math.round(numPrice * 100) / 100;
  }

  saveOrder(order: Order): Observable<any> {
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5004/api/orders/add'
      : 'https://short-coats-dig.loca.lt/api/orders/add';

    const authToken = this.userService.authToken();
    const headers = authToken 
      ? new HttpHeaders().set('Authorization', authToken)
      : new HttpHeaders();

    console.log('OrderService: Sending order payload:', order);

    return this.httpClient.post(baseURL, order, { headers }).pipe(
      retry(1),
      catchError(error => {
        console.error('OrderService: API Error:', error);
        throw error;
      })
    );
  }
  getOrders(userEmail: string): Observable<PastOrder[]> {
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5004/api/orders/allorders?userEmail='
      : 'https://short-coats-dig.loca.lt/api/orders/allorders?userEmail=';
    const url = `${baseURL}${userEmail}`;

    let headers: HttpHeaders;
    const authToken = this.userService.authToken();
    if (authToken) {
      headers = new HttpHeaders().set('Authorization', authToken);
    } else {
      headers = new HttpHeaders();
    }

    return this.httpClient.get<PastOrder[]>(url, { headers });
  }
  getOrderProducts(orderId: number): Observable<PastOrderProduct[]> {
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost:5004/api/orders/orderproducts?orderId='
      : 'https://short-coats-dig.loca.lt/api/orders/orderproducts?orderId=';
    const url = `${baseURL}${orderId}`;

    let headers: HttpHeaders;
    const authToken = this.userService.authToken();
    if (authToken) {
      headers = new HttpHeaders().set('Authorization', authToken);
    } else {
      headers = new HttpHeaders();
    }

    return this.httpClient.get<PastOrderProduct[]>(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Failed to load order products:', error);
          console.error('Order ID:', orderId);
          console.error('Error status:', error.status);
          console.error('Error details:', error.error);
          throw error;
        })
      );
  }
}
