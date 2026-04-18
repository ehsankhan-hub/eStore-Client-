import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter, interval, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../../../api-url';

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeNotificationService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // State
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal<number>(0);
  
  private lastKnownOrderCount = 0;
  private readonly apiBase = API_BASE_URL;

  constructor() {
    // Start the "Pulse" if user is logged in
    this.initRealtimeSync();
  }

  private initRealtimeSync() {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Pulse every 30 seconds for non-intrusive updates
    interval(30000).pipe(
      filter(() => !!localStorage.getItem('token')),
      switchMap(() => {
        const headers = new HttpHeaders().set('Authorization', localStorage.getItem('token') || '');
        return this.http.get<any[]>(`${this.apiBase}/orders/allorders?userEmail=${this.getUserEmail()}`, { headers });
      })
    ).subscribe({
      next: (orders) => {
        if (this.lastKnownOrderCount > 0 && orders.length > this.lastKnownOrderCount) {
          this.pushNotification({
            type: 'success',
            title: 'Order Placed',
            message: 'Your new order has been officially registered!'
          });
        }
        this.lastKnownOrderCount = orders.length;
      }
    });
  }

  private getUserEmail(): string {
    return localStorage.getItem('email') || '';
  }

  pushNotification(config: { type: AppNotification['type'], title: string, message: string }) {
    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(7),
      ...config,
      timestamp: new Date(),
      isRead: false
    };

    this.notifications.update(prev => [newNotification, ...prev]);
    this.unreadCount.update(count => count + 1);

    // Auto-dismiss logic for the UI could go here
    console.log('🔔 Notification:', config.title);
  }

  markAllAsRead() {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
  }

  clearAll() {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }
}
