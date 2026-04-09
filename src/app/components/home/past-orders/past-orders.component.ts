import { Component, computed, effect, inject, signal } from '@angular/core';
import { PastOrder, PastOrderProduct } from '../types/order.type';
import { CommonModule } from '@angular/common';
import { OrderService } from '../services/order/order.service';
import { UserService } from '../services/user/user.service';
import { OrderStore } from '../services/order/order.store';

@Component({
  selector: 'app-past-orders',
  imports: [CommonModule],
  templateUrl: './past-orders.component.html',
  styleUrl: './past-orders.component.css',
})
export class PastOrdersComponent {
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private orderStore = inject(OrderStore);

  selectedOrderId = signal<number | null>(null);
  readonly pastOrderProducts = signal<PastOrderProduct[]>([]);

  // Use OrderStore as single source of truth
  readonly pastOrders = this.orderStore.orders;
  readonly loading = this.orderStore.loading;
  readonly error = this.orderStore.error;
  readonly hasOrders = this.orderStore.hasOrders;

  // selected past order
  readonly pastOrder = computed(() =>
    this.pastOrders().find((o: PastOrder) => o.orderId === this.selectedOrderId())
  );

  constructor() {
    // Load orders on initialization
    this.orderStore.loadOrders();
    
    effect(() => {
      const id = this.selectedOrderId();
      if (id) {
        this.orderService.getOrderProducts(id).subscribe({
          next: (products) => {
            this.pastOrderProducts.set(products);
          },
          error: (error) => {
            console.error('Failed to load order products:', error);
            // Set empty array on error to prevent UI issues
            this.pastOrderProducts.set([]);
            // Could show a user-friendly message here if needed
          }
        });
      } else {
        this.pastOrderProducts.set([]);
      }
    });
  }

  selectOrder(event: Event): void {
    const value = Number.parseInt((event.target as HTMLSelectElement).value);
    this.selectedOrderId.set(value > 0 ? value : null);
  }
}
