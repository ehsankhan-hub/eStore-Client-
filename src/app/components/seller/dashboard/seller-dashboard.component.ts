import { Component, OnInit, signal, computed } from '@angular/core';
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
      
      <!-- Premium Analytics Section -->
      <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-12 relative overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/5">
        <!-- Shine Effect -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-white/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 relative z-10">
          <div>
            <h3 class="text-2xl font-black text-gray-900 flex items-center gap-4">
               <span class="w-2 h-8 bg-indigo-500 rounded-full"></span>
               Revenue Velocity
            </h3>
            <p class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2 ml-6">Real-time performance metrics</p>
          </div>

          <div class="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
             <button (click)="activeTab.set('overview')" 
                     [class.bg-white]="activeTab() === 'overview'"
                     [class.shadow-sm]="activeTab() === 'overview'"
                     [class.text-indigo-600]="activeTab() === 'overview'"
                     [class.text-gray-400]="activeTab() !== 'overview'"
                     class="px-5 py-2 rounded-xl text-xs font-black transition-all">Overview</button>
             <button (click)="activeTab.set('category')" 
                     [class.bg-white]="activeTab() === 'category'"
                     [class.shadow-sm]="activeTab() === 'category'"
                     [class.text-indigo-600]="activeTab() === 'category'"
                     [class.text-gray-400]="activeTab() !== 'category'"
                     class="px-5 py-2 rounded-xl text-xs font-black transition-all ml-1">By Category</button>
          </div>
        </div>

        <!-- Overview: The SVG Graph -->
        <div *ngIf="activeTab() === 'overview'" class="h-64 relative w-full px-2 animate-fade-in">
            <!-- Grid Lines -->
            <div class="absolute inset-x-0 bottom-0 h-px bg-gray-100 italic font-mono text-[9px] text-gray-300 flex items-center justify-end pr-2">0.00</div>
            <div class="absolute inset-x-0 bottom-1/4 h-px bg-gray-50 italic font-mono text-[9px] text-gray-200 flex items-center justify-end pr-2">25k</div>
            <div class="absolute inset-x-0 bottom-2/4 h-px bg-gray-50 italic font-mono text-[9px] text-gray-200 flex items-center justify-end pr-2">50k</div>
            <div class="absolute inset-x-0 bottom-3/4 h-px bg-gray-50 italic font-mono text-[9px] text-gray-200 flex items-center justify-end pr-2">75k</div>

            <!-- SVG Area Chart -->
            <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#4f46e5" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#6366f1" />
                        <stop offset="50%" stop-color="#8b5cf6" />
                        <stop offset="100%" stop-color="#4f46e5" />
                    </linearGradient>
                </defs>
                
                <!-- Area Fill -->
                <path d="M0,180 Q100,160 200,140 T400,100 T600,60 T800,120 T1000,40 L1000,200 L0,200 Z" 
                      fill="url(#areaGradient)" 
                      style="opacity: 1; transition: all 1s ease-in-out;" />
                
                <!-- Border Line -->
                <path d="M0,180 Q100,160 200,140 T400,100 T600,60 T800,120 T1000,40" 
                      fill="none" 
                      stroke="url(#lineGradient)" 
                      stroke-width="5" 
                      stroke-linecap="round"
                      style="filter: drop-shadow(0 10px 10px rgba(99,102,241,0.2));" />

                <!-- Data Points -->
                <circle cx="200" cy="140" r="4" fill="white" stroke="#6366f1" stroke-width="2" />
                <circle cx="400" cy="100" r="4" fill="white" stroke="#8b5cf6" stroke-width="2" />
                <circle cx="600" cy="60"  r="4" fill="white" stroke="#8b5cf6" stroke-width="2" />
                <circle cx="800" cy="120" r="4" fill="white" stroke="#4f46e5" stroke-width="2" />
                <circle cx="1000" cy="40" r="6" fill="#4f46e5" stroke="white" stroke-width="3" />
            </svg>

            <!-- X-Axis Labels -->
            <div class="flex justify-between mt-6 px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                <span>Jan 01</span>
                <span>Jan 08</span>
                <span>Jan 15</span>
                <span>Jan 22</span>
                <span>Active Today</span>
            </div>
        </div>

        <!-- By Category: Distribution Bars -->
        <div *ngIf="activeTab() === 'category'" class="space-y-8 animate-fade-in">
            <div *ngFor="let cat of categoryData()" class="group">
                <div class="flex justify-between items-end mb-3">
                    <div>
                        <span class="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                            {{ cat.name }}
                        </span>
                        <span class="ml-3 text-[10px] font-bold text-gray-300">
                           {{ cat.percentage | number:'1.0-0' }}% OF SALES
                        </span>
                    </div>
                    <span class="text-sm font-black text-gray-900">{{ cat.value | currency }}</span>
                </div>
                <div class="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                         [style.width.%]="cat.percentage">
                    </div>
                </div>
            </div>

            <!-- Empty State for Categories -->
            <div *ngIf="categoryData().length === 0" class="py-10 text-center text-gray-400 font-bold italic text-sm">
                Awaiting first categorized sale...
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
                  <th class="pb-6">Category</th>
                  <th class="pb-6">Product</th>
                  <th class="pb-6">Qty</th>
                  <th class="pb-6 text-right pr-4">Earnings</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let sale of sales()" class="group hover:bg-gray-50/50 transition-all">
                  <td class="py-6 pl-4 font-mono text-xs text-indigo-500 font-bold">#{{ sale.orderId }}</td>
                  <td class="py-6 text-sm font-medium text-gray-600">{{ sale.orderDate | date:'mediumDate' }}</td>
                  <td class="py-6 text-sm font-bold text-gray-900">{{ sale.customerName }}</td>
                  <td class="py-6">
                    <span [class]="getCategoryClass(sale.categoryName)" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                       {{ sale.categoryName }}
                    </span>
                  </td>
                  <td class="py-6">
                    <div class="inline-block text-xs font-bold text-gray-600">
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
  
  // New Analytics State
  activeTab = signal<'overview' | 'category'>('overview');

  // Compute Category Data dynamically for the graph
  categoryData = computed(() => {
    const groups: { [key: string]: number } = {};
    this.sales().forEach(sale => {
      const cat = sale.categoryName || 'Uncategorized';
      groups[cat] = (groups[cat] || 0) + parseFloat(sale.subtotal);
    });
    
    // Convert to array for template iteration
    return Object.keys(groups).map(name => ({
      name,
      value: groups[name],
      percentage: (groups[name] / (this.summary().totalSales || 1)) * 100
    })).sort((a, b) => b.value - a.value);
  });

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
      // If admin, show everything!
      const sellerId = user.role === 'admin' ? 'all' : user.id;
      this.sellerService.getOrders(sellerId).subscribe({
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

  getCategoryClass(category: string): string {
    const cat = (category || '').toLowerCase();
    if (cat.includes('elect')) return 'bg-blue-50 text-blue-600 border border-blue-100';
    if (cat.includes('cloth') || cat.includes('fashion')) return 'bg-amber-50 text-amber-600 border border-amber-100';
    if (cat.includes('home') || cat.includes('kitchen')) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    return 'bg-gray-50 text-gray-400 border border-gray-100';
  }
}
