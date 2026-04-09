import { Injectable, signal, computed } from '@angular/core';
import { Order, PastOrder } from '../../types/order.type';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { DeliveryAddress } from '../../types/cart.type';
import { Observable, tap, catchError } from 'rxjs';

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
    private userService: UserService
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

    return this.orderService.saveOrder(deliveryAddress, userEmail).pipe(
      tap(result => {
        // Refresh orders to include the new one
        this.loadOrders();
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Failed to create order');
        this._loading.set(false);
        throw error;
      })
    );
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
