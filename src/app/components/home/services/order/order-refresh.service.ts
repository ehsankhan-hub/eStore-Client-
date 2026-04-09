import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderRefreshService {
  // Subject to trigger order refresh across components
  private orderRefreshTrigger = new Subject<void>();

  // Observable that components can subscribe to
  orderRefresh$ = this.orderRefreshTrigger.asObservable();

  // Method to trigger order refresh
  refreshOrders(): void {
    this.orderRefreshTrigger.next();
  }
}
