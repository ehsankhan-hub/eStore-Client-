import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../api-url';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  stats: any = {
    buyers: 0,
    sellers: 0,
    admins: 0,
    newUsers: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    pendingRevenue: 0
  };

  get grossSales(): number {
    return (Number(this.stats.revenue) || 0) + (Number(this.stats.pendingRevenue) || 0);
  }

  get serviceFees(): number {
    return this.grossSales * 0.10; // Assuming 10% platform fee
  }

  get netEarnings(): number {
    return this.grossSales * 0.90; // Assuming 90% goes to sellers/net
  }

  homepageBlocks: any[] = [];
  systemSettings: any[] = [];
  selectedBlock: any = null;
  activeTab: string = 'stats';

  private readonly apiBase = API_BASE_URL;

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
        this.router.navigate(['/auth/login']);
        return;
    }
    this.fetchStats();
    this.fetchHomepageBlocks();
    this.fetchSettings();
  }

  fetchSettings() {
    console.log('AdminDashboard: Fetching settings from database...');
    const headers = new HttpHeaders().set('Authorization', localStorage.getItem('token') || '');
    this.http.get<any[]>(`${this.apiBase}/admin/settings`, { headers }).subscribe({
      next: (data) => {
        console.log('AdminDashboard: Settings received successfully', data);
        this.systemSettings = data;
      },
      error: (err) => {
        console.error('AdminDashboard: ERROR fetching settings', err);
        if (err.status === 404) {
            console.error('The route /api/admin/settings was not found on the server!');
        }
      }
    });
  }

  isSaving: string | null = null;

  updateSetting(setting: any) {
    this.isSaving = setting.setting_key;
    const headers = new HttpHeaders().set('Authorization', localStorage.getItem('token') || '');
    this.http.post(`${this.apiBase}/admin/settings`, setting, { headers }).subscribe({
      next: () => {
        setTimeout(() => this.isSaving = null, 1500);
        console.log(`${setting.setting_key} updated`);
      },
      error: (err) => {
        this.isSaving = null;
        alert('Update failed: ' + err.message);
      }
    });
  }

  fetchStats() {
    const headers = new HttpHeaders().set('Authorization', localStorage.getItem('token') || '');
    this.http.get(`${this.apiBase}/admin/stats`, { headers }).subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error fetching stats', err)
    });
  }

  fetchHomepageBlocks() {
    this.http.get<any[]>(`${this.apiBase}/homepage/public`).subscribe({
      next: (data) => this.homepageBlocks = data,
      error: (err) => console.error('Error fetching blocks', err)
    });
  }

  editBlock(block: any) {
    this.selectedBlock = { ...block };
    if (typeof this.selectedBlock.items_payload === 'string') {
        this.selectedBlock.items_payload = JSON.parse(this.selectedBlock.items_payload);
    }
    if (typeof this.selectedBlock.link_params === 'string') {
        this.selectedBlock.link_params = JSON.parse(this.selectedBlock.link_params);
    }
    this.activeTab = 'editor';
  }

  saveBlock() {
    const headers = new HttpHeaders().set('Authorization', localStorage.getItem('token') || '');
    this.http.post(`${this.apiBase}/admin/homepage/blocks`, this.selectedBlock, { headers }).subscribe({
      next: () => {
        alert('Saved successfully!');
        this.fetchHomepageBlocks();
        this.activeTab = 'blocks';
      },
      error: (err) => alert('Failed to save: ' + err.message)
    });
  }
}
