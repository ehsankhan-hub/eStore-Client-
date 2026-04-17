import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeNotificationService } from '../../home/services/notification/realtime-notification.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark, faCircleInfo, faCircleCheck, faTriangleExclamation, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="toast-container">
      @for (n of notificationService.notifications(); track n.id) {
        @if (!n.isRead) {
          <div class="luxury-toast" [class]="n.type">
            <div class="toast-icon">
              <fa-icon [icon]="getIcon(n.type)"></fa-icon>
            </div>
            <div class="toast-content">
              <h3>{{ n.title }}</h3>
              <p>{{ n.message }}</p>
            </div>
            <button class="close-btn" (click)="n.isRead = true">
              <fa-icon [icon]="faXmark"></fa-icon>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 100px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }
    .luxury-toast {
      pointer-events: auto;
      width: 380px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      gap: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-left: 4px solid #6366f1;
    }
    .luxury-toast.success { border-left-color: #10b981; }
    .luxury-toast.error { border-left-color: #f43f5e; }
    .luxury-toast.warning { border-left-color: #fbbf24; }
    
    .toast-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6366f1;
    }
    .success .toast-icon { color: #10b981; }
    .error .toast-icon { color: #f43f5e; }
    
    .toast-content h3 {
      font-size: 0.9rem;
      font-weight: 800;
      color: white;
      margin-bottom: 2px;
    }
    .toast-content p {
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.4;
    }
    .close-btn {
      margin-left: auto;
      background: transparent;
      border: none;
      color: #475569;
      cursor: pointer;
      transition: color 0.2s;
    }
    .close-btn:hover { color: white; }
    
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NotificationToastComponent {
  notificationService = inject(RealtimeNotificationService);
  faXmark = faXmark;
  faCircleCheck = faCircleCheck;
  faTriangleExclamation = faTriangleExclamation;
  faCircleExclamation = faCircleExclamation;
  faCircleInfo = faCircleInfo;

  getIcon(type: string) {
    switch (type) {
      case 'success': return this.faCircleCheck;
      case 'warning': return this.faTriangleExclamation;
      case 'error': return this.faCircleExclamation;
      default: return this.faCircleInfo;
    }
  }
}
