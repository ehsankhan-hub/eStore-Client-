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
  ) {}

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

  saveOrder(
    deliveryAddress: DeliveryAddress,
    userEmail: string
  ): Observable<any> {
    return new Observable(observer => {
      // Wait a moment for cart to be fully initialized
      setTimeout(() => {
        const baseURL = window.location.hostname === 'localhost'
          ? 'http://localhost:5004/api/orders/add'
          : 'https://short-coats-dig.loca.lt/api/orders/add';
        
        // Safely access cart with null checks
        const cart = this.cartStore.cart();
        console.log('Cart data:', cart); // Debug log
        
        if (!cart) {
          console.error('Cart is null or undefined');
          observer.error(new Error('Cart is not available'));
          observer.complete();
          return;
        }
        
        console.log('Sending order to:', baseURL);
        
        if (!cart.products || cart.products.length === 0) {
          console.error('Cart products are empty or not available');
          observer.error(new Error('Cart is empty'));
          observer.complete();
          return;
        }
        
        const orderDetails: OrderItem[] = [];
        cart.products.forEach((product) => {
          // Skip products with zero price or amount
          if (this.formatPrice(product.product.price) <= 0 || this.formatPrice(product.amount) <= 0) {
            console.warn('Skipping product with zero price/amount:', product.product.id);
            return;
          }
          
          const orderItem: OrderItem = {
            productId: product.product.id,
            price: this.formatPrice(product.product.price),
            qty: product.quantity,
            amount: this.formatPrice(product.amount),
          };
          orderDetails.push(orderItem);
        });

        const order: Order = {
          userName: deliveryAddress.userName,
          address: deliveryAddress.address,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          pin: deliveryAddress.pin,
          total: this.formatPrice(cart.totalAmount),
          userEmail: userEmail,
          orderDetails: orderDetails,
        };

        // Validate order before sending
        if (orderDetails.length === 0) {
          console.error('No valid order details to submit');
          observer.error(new Error('No valid products in order'));
          observer.complete();
          return;
        }

        // Debug: Log the order data being sent
        console.log('Order data being sent:', JSON.stringify(order, null, 2));

        let headers: HttpHeaders;
        const authToken = this.userService.authToken(); // Get the current token value
        if (authToken) {
          headers = new HttpHeaders().set('Authorization', authToken);
        } else {
          headers = new HttpHeaders(); // Or you could set it to undefined, depending on your backend's requirements
        }

        this.httpClient.post(baseURL, order, { headers })
          .pipe(
            // Simple retry for deadlock handling
            retry(2),
            catchError(error => {
              console.error('Order submission error:', error);
              console.error('Error status:', error.status);
              console.error('Error statusText:', error.statusText);
              console.error('Error details:', error.error);
              console.error('Error message:', error.message);
              console.error('Full error object:', JSON.stringify(error, null, 2));
              
              // If it's a deadlock error, provide a user-friendly message
              if (error.status === 500 && error.error?.code === 'ER_LOCK_DEADLOCK') {
                console.warn('Database deadlock occurred. This is a temporary issue. Please try again in a few seconds.');
              }
              
              throw error; // Re-throw to maintain error flow
            })
          )
          .subscribe({
            next: (response) => {
              console.log('Order submitted successfully:', response);
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              console.error('Order submission failed:', error);
              observer.error(error);
              observer.complete();
            }
          });
      }, 100); // 100ms delay to ensure cart is initialized
    });
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
