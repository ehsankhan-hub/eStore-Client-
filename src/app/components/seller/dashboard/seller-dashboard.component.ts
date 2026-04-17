import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../home/services/user/user.service';
import { SellerService } from '../../../services/seller.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container max-w-6xl mx-auto p-6 md:p-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 class="text-4xl font-black text-gray-900 tracking-tight">Seller Dashboard</h2>
          <p class="text-gray-500 mt-1 font-medium italic">Welcome back, {{ sellerName }}! Here is your business at a glance.</p>
        </div>
        
        <!-- Stripe Status Badge / Action -->
        <div *ngIf="!isStripeConnected()" class="bg-amber-50 border-2 border-amber-100 p-5 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
           <div class="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
           </div>
           <div>
             <p class="text-amber-800 font-black text-sm uppercase tracking-wide">Payouts Disabled</p>
             <p class="text-[11px] text-amber-600 font-medium">Connect Stripe to receive your earnings.</p>
           </div>
           <button (click)="onboardStripe()" 
                   [disabled]="loadingOnboarding()"
                   class="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3">
             <span *ngIf="loadingOnboarding()" class="animate-spin text-[10px]">⌛</span>
             CONNECT STRIPE
           </button>
        </div>

        <div *ngIf="isStripeConnected()" class="bg-emerald-50 border-2 border-emerald-100 p-5 rounded-3xl flex items-center gap-5 shadow-sm">
           <div class="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <div>
             <p class="text-emerald-800 font-black text-sm uppercase tracking-wide">Payouts Active</p>
             <p class="text-[11px] text-emerald-600 font-black uppercase tracking-widest opacity-70">Secured via Stripe</p>
           </div>
        </div>
      </div>
      
      <!-- Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
          <h3 class="text-gray-400 text-[11px] uppercase font-black tracking-[0.2em] mb-3">Gross Sales</h3>
          <p class="text-4xl font-black text-gray-900">{{ summary().totalSales | currency }}</p>
          <div class="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs">
             <span class="bg-emerald-100 px-2 py-0.5 rounded-full">↑ Live</span>
             <span class="text-gray-400 font-medium">All time volume</span>
          </div>
        </div>
        
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div class="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
          <h3 class="text-gray-400 text-[11px] uppercase font-black tracking-[0.2em] mb-3">Service Fees (10%)</h3>
          <p class="text-4xl font-black text-rose-500">{{ summary().platformFee | currency }}</p>
          <div class="mt-4 flex items-center gap-2 text-gray-400 font-medium text-xs">
             <span>Platform maintenance contribute</span>
          </div>
        </div>
        
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-emerald-500 bg-emerald-50/10 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
          <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
          <h3 class="text-emerald-700 text-[11px] uppercase font-black tracking-[0.2em] mb-3">Net Earnings</h3>
          <p class="text-4xl font-black text-emerald-600">{{ summary().readyForPayout | currency }}</p>
          <div class="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs">
             <span class="bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-100">💰 Ready for Withdrawal</span>
          </div>
        </div>
      </div>
      
      <!-- Recent Sales Table -->
      <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-10">
          <h3 class="text-2xl font-black text-gray-900 flex items-center gap-4">
             <span class="w-2 h-8 bg-indigo-500 rounded-full"></span>
             Transaction History
          </h3>
          <button (click)="loadSales()" class="text-gray-400 hover:text-indigo-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
          </button>
        </div>

        <!-- Order Table -->
        <div class="overflow-hidden" *ngIf="sales().length > 0; else emptyState">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                  <th class="pb-6 pl-4">Order ID</th>
                  <th class="pb-6">Date</th>
                  <th class="pb-6">Customer</th>
                  <th class="pb-6">Product</th>
                  <th class="pb-6">Qty</th>
                  <th class="pb-6 text-right pr-4">Earnings</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let sale of sales()" class="group hover:bg-gray-50/50 transition-all">
                  <td class="py-6 pl-4 font-mono text-xs text-indigo-500 font-bold">#{{ sale.order_id }}</td>
                  <td class="py-6 text-sm font-medium text-gray-600">{{ sale.orderDate | date:'mediumDate' }}</td>
                  <td class="py-6 text-sm font-bold text-gray-900">{{ sale.customerName }}</td>
                  <td class="py-6">
                    <div class="bg-gray-100 inline-block px-3 py-1 rounded-xl text-xs font-bold text-gray-700">
                       {{ sale.product_name }}
                    </div>
                  </td>
                  <td class="py-6 text-sm font-black text-gray-400">x{{ sale.quantity }}</td>
                  <td class="py-6 text-right pr-4">
                    <p class="text-sm font-black text-emerald-600">+{{ sale.subtotal | currency }}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <ng-template #emptyState>
           <div class="flex flex-col items-center justify-center py-24 text-center">
              <div class="w-24 h-24 bg-gray-50 rounded-[2rem] mb-6 flex items-center justify-center text-gray-200">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
              </div>
              <p class="text-gray-400 font-black text-lg">No sales transactions found yet.</p>
              <p class="text-xs text-gray-300 mt-2 font-medium">Keep growing your inventory to see magic happen here!</p>
           </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #fcfcfd; min-height: 100vh; }
    .animate-spin { display: inline-block; vertical-align: middle; }
  `]
})
export class SellerDashboardComponent implements OnInit {
  isStripeConnected = signal<boolean>(false);
  loadingOnboarding = signal<boolean>(false);
  sellerName = '';

  sales = signal<any[]>([]);
  summary = signal<any>({ totalSales: 0, platformFee: 0, readyForPayout: 0 });

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private sellerService: SellerService
  ) { }

  ngOnInit(): void {
    const user = this.userService.loggedInUserInfo();
    console.log('Seller Dashboard: Logged in User:', user);
    if (user) {
      if (user.is_stripe_connected) this.isStripeConnected.set(true);
      this.sellerName = user.email;
      this.loadSales();
    }
  }

  loadSales() {
    const user = this.userService.loggedInUserInfo();
    if (user && user.id !== undefined) {
      this.sellerService.getOrders(user.id).subscribe({
        next: (data) => {
          this.sales.set(data.orders);
          this.summary.set(data.summary);
        },
        error: (err) => console.error('Failed to load sales', err)
      });
    }
  }

  onboardStripe() {
    this.loadingOnboarding.set(true);
    const url = 'http://localhost:5004/api/payments/onboard-seller';
    const headers = { 'Authorization': this.userService.authToken() || '' };

    this.http.post<{ url: string }>(url, {}, { headers }).subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        console.error('Onboarding failed', err);
        this.loadingOnboarding.set(false);
        alert('Could not start onboarding. Please try again later.');
      }
    });
  }
}
