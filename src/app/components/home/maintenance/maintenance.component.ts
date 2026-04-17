import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="maintenance-overlay">
      <div class="maintenance-card">
        <div class="icon-circle">
          <i class="fas fa-tools"></i>
        </div>
        <h1>Under Maintenance</h1>
        <p>We're currently upgrading your shopping experience. We'll be back online in a few minutes!</p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="store-brand">eStore Premium</div>
      </div>
    </div>
  `,
  styles: [`
    .maintenance-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999;
      font-family: 'Inter', sans-serif;
    }
    .maintenance-card {
      background: white;
      padding: 50px;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 450px;
      width: 90%;
    }
    .icon-circle {
      width: 80px; height: 80px;
      background: #ebf5ff;
      color: #3182ce;
      font-size: 2rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      margin: 0 auto 24px;
    }
    h1 { color: #2d3748; font-size: 1.8rem; margin-bottom: 12px; font-weight: 800; }
    p { color: #718096; line-height: 1.6; margin-bottom: 30px; }
    .progress-bar {
      height: 6px; background: #edf2f7; border-radius: 3px; overflow: hidden; margin-bottom: 30px;
    }
    .progress-fill {
      width: 40%; height: 100%; background: #3182ce;
      animation: slide 2s infinite ease-in-out;
    }
    @keyframes slide {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(250%); }
    }
    .store-brand {
      font-weight: bold; color: #a0aec0; letter-spacing: 2px; text-transform: uppercase; font-size: 0.75rem;
    }
  `]
})
export class MaintenanceComponent {}
