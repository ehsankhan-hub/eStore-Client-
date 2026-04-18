import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api-url';

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {
  private http = inject(HttpClient);
  isMaintenance = signal<boolean>(false);
  shippingFreeThreshold = signal<number>(500);
  shippingBaseRate = signal<number>(25);

  private readonly apiBase = API_BASE_URL;

  loadSystemSettings() {
    this.http.get<any[]>(`${this.apiBase}/admin/settings/public`).subscribe({
      next: (settings) => {
        // Maintenance Mode
        const mode = settings.find(s => s.setting_key === 'MAINTENANCE_MODE');
        const mVal = mode?.setting_value;
        this.isMaintenance.set(mVal === 'true' || mVal === '1' || mVal === true);

        // Shipping Threshold
        const threshold = settings.find(s => s.setting_key === 'SHIPPING_FREE_THRESHOLD');
        if (threshold) this.shippingFreeThreshold.set(parseFloat(threshold.setting_value) || 500);

        // Shipping Rate
        const rate = settings.find(s => s.setting_key === 'SHIPPING_BASE_RATE');
        if (rate) this.shippingBaseRate.set(parseFloat(rate.setting_value) || 25);
      },
      error: (err) => {
        if (err.status === 503) {
          this.isMaintenance.set(true);
        }
      }
    });
  }
}
