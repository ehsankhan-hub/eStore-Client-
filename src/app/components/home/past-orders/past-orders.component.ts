import { Component, computed, effect, inject, signal } from '@angular/core';
import { PastOrder, PastOrderProduct } from '../types/order.type';
import { CommonModule } from '@angular/common';
import { OrderService } from '../services/order/order.service';
import { UserService } from '../services/user/user.service';
import { OrderStore } from '../services/order/order.store';
import { FontAwesomeModule, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { 
  faBox, 
  faCalendarAlt, 
  faCheckCircle, 
  faChevronRight, 
  faClock, 
  faMapMarkerAlt, 
  faReceipt, 
  faShoppingBag, 
  faTruck,
  faSearch,
  faFilter,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../../../api-url';

@Component({
  selector: 'app-past-orders',
  imports: [CommonModule, FontAwesomeModule, FaIconComponent, FormsModule],
  templateUrl: './past-orders.component.html',
  styleUrl: './past-orders.component.css',
})
export class PastOrdersComponent {
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private orderStore = inject(OrderStore);

  // Icons
  faBox = faBox;
  faCalendarAlt = faCalendarAlt;
  faCheckCircle = faCheckCircle;
  faChevronRight = faChevronRight;
  faClock = faClock;
  faMapMarkerAlt = faMapMarkerAlt;
  faReceipt = faReceipt;
  faShoppingBag = faShoppingBag;
  faTruck = faTruck;
  faSearch = faSearch;
  faFilter = faFilter;
  faTimesCircle = faTimesCircle;

  selectedOrderId = signal<number | null>(null);
  searchTerm = signal<string>('');
  readonly pastOrderProducts = signal<PastOrderProduct[]>([]);

  readonly pastOrders = this.orderStore.orders;
  readonly loading = this.orderStore.loading;
  readonly error = this.orderStore.error;
  readonly hasOrders = this.orderStore.hasOrders;

  // Filtered Orders Logic
  readonly filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.pastOrders();

    return this.pastOrders().filter(order => 
      order.orderId.toString().includes(term) ||
      order.userName.toLowerCase().includes(term) ||
      order.city.toLowerCase().includes(term) ||
      order.address.toLowerCase().includes(term)
    );
  });

  readonly pastOrder = computed(() =>
    this.pastOrders().find((o: PastOrder) => o.orderId === this.selectedOrderId())
  );

  private imageBasePath = '/assets/images/';

  readonly loadingProducts = signal<boolean>(false);

  constructor() {
    this.orderStore.loadOrders();
    
    effect(() => {
      const id = this.selectedOrderId();
      if (id) {
        console.log('Loading products for order:', id);
        this.loadingProducts.set(true);
        this.orderService.getOrderProducts(id).subscribe({
          next: (products) => {
            console.log('Successfully loaded products:', products.length);
            this.pastOrderProducts.set(products);
            this.loadingProducts.set(false);
          },
          error: (error) => {
            console.error('Failed to load order products:', error);
            this.pastOrderProducts.set([]);
            this.loadingProducts.set(false);
          }
        });
      } else {
        this.pastOrderProducts.set([]);
      }
    });
  }

  getImageUrl(imageName: string | undefined): string {
    if (!imageName || imageName === 'undefined' || imageName.trim() === '') {
      return `${this.imageBasePath}shop-1.jpg`;
    }
    
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }

    const baseURL = `${API_BASE_URL}/`;

    if (imageName.startsWith('uploads/')) {
      return `${baseURL}${imageName}`;
    }
    
    // If it's a numeric timestamp style filename (e.g. 1776...), it's in uploads
    if (/^\d{10,}/.test(imageName)) {
      return `${baseURL}uploads/${imageName}`;
    }
    
    return `${this.imageBasePath}${imageName}`;
  }

  selectOrder(id: number): void {
    if (this.selectedOrderId() === id) {
      this.selectedOrderId.set(null);
    } else {
      this.selectedOrderId.set(id);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }
}
