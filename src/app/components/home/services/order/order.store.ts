import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderItem, PastOrder } from '../../types/order.type';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { CartStoreItem } from '../cart/cart.storeItem';
import { DeliveryAddress } from '../../types/cart.type';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderStore {
  // Private state signals
  private _orders = signal<PastOrder[]>([]);
  private _currentOrder = signal<Order | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public computed signals (read-only)
  readonly orders = computed(() => this._orders());
  readonly currentOrder = computed(() => this._currentOrder());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // Additional computed signals
  readonly orderCount = computed(() => this._orders().length);
  readonly hasOrders = computed(() => this._orders().length > 0);
  readonly recentOrders = computed(() => 
    this._orders().slice().sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  );

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private cartStore: CartStoreItem
  ) {}

  // Actions
  loadOrders(): void {
    const userEmail = this.userService.loggedInUserInfo().email;
    if (!userEmail) return;

    this._loading.set(true);
    this._error.set(null);

    this.orderService.getOrders(userEmail).subscribe({
      next: (orders) => {
        this._orders.set(orders);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Failed to load orders');
        this._loading.set(false);
      }
    });
  }

  createOrder(deliveryAddress: DeliveryAddress, userEmail: string): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    // 1. Get the "Single Source of Truth" - Synchronous snapshot of the cart
    const cart = this.cartStore.cart();
    
    if (!cart || !cart.products || cart.products.length === 0) {
      this._error.set('Cannot create order: Cart is empty.');
      this._loading.set(false);
      return throwError(() => new Error('Cart is empty'));
    }

    // 2. Map cart products to order details
    const orderDetails: OrderItem[] = cart.products.map(item => ({
      productId: item.product.id,
      qty: item.quantity,
      price: this.formatPrice(item.product.price),
      amount: this.formatPrice(item.amount)
    }));

    // 3. Build the final Order payload
    const orderPayload: Order = {
      userName: deliveryAddress.userName,
      address: deliveryAddress.address,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      pin: deliveryAddress.pin,
      total: this.formatPrice(cart.totalAmount),
      shippingCost: this.formatPrice(cart.shippingCost),
      userEmail: userEmail,
      orderDetails: orderDetails
    };

    console.log('OrderStore: Orchestrated payload from SSOT:', orderPayload);

    return this.orderService.saveOrder(orderPayload).pipe(
      tap(result => {
        this.loadOrders();
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Failed to create order');
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }

  private formatPrice(price: any): number {
    const num = Number(typeof price === 'string' ? price.replace(/[^0-9.-]/g, '') : price);
    return Math.round((num || 0) * 100) / 100;
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  clearCurrentOrder(): void {
    this._currentOrder.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  // Get order by ID
  getOrderById(orderId: number): PastOrder | undefined {
    return this._orders().find(order => order.orderId === orderId);
  }
}
