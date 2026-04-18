import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../home/services/user/user.service';
import { SellerService } from '../../../services/seller.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div class="flex items-center gap-4">
             <span class="w-2 h-8 bg-indigo-500 rounded-full"></span>
             <h3 class="text-2xl font-black text-gray-900">Transaction History</h3>
          </div>

          <!-- Active Search Field -->
          <div class="relative w-full lg:w-96 group">
            <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
            <input type="text" 
                   [ngModel]="searchTerm()"
                   (ngModelChange)="searchTerm.set($event)"
                   placeholder="Search ID, Product, or Category..." 
                   class="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-3 pl-14 pr-6 text-sm font-bold text-gray-900 outline-none transition-all shadow-inner placeholder:text-gray-300">
            <div *ngIf="searchTerm()" (click)="searchTerm.set('')" class="absolute inset-y-0 right-5 flex items-center cursor-pointer text-gray-300 hover:text-rose-500 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </div>
          </div>

          <button (click)="loadSales()" class="text-gray-400 hover:text-indigo-600 transition-colors hidden lg:block">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
          </button>
        </div>

        <!-- Order Table: Grouped by Category Accordion -->
        <div class="space-y-6" *ngIf="groupedSales().length > 0; else emptyState">
          <div *ngFor="let group of groupedSales()" class="bg-gray-50/50 rounded-[2rem] overflow-hidden border border-gray-100 transition-all">
            <!-- Category Header Row -->
            <div (click)="toggleCategory(group.name)" 
                 class="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-100/50 transition-colors group/header">
              <div class="flex items-center gap-6">
                <!-- Status Icon -->
                <div class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm"
                     [class]="isExpanded(group.name) ? 'bg-indigo-600 text-white rotate-45' : 'bg-white text-indigo-600'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                   <h4 class="text-lg font-black text-gray-900 uppercase tracking-tight">{{ group.name }}</h4>
                   <p class="text-xs text-gray-400 font-bold">{{ group.orders.length }} Transactions</p>
                </div>
              </div>
              <div class="text-right">
                 <p class="text-xl font-black text-indigo-600">{{ group.totalEarnings | currency }}</p>
                 <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Category Total</p>
              </div>
            </div>

            <!-- Expanded Content -->
            <div *ngIf="isExpanded(group.name)" class="px-6 pb-6 animate-slide-down">
               <div class="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="text-gray-400 text-[9px] uppercase font-black tracking-widest border-b border-gray-50">
                        <th class="py-4 pl-6">ID</th>
                        <th class="py-4 text-center">Date</th>
                        <th class="py-4">Product</th>
                        <th class="py-4 text-center">Qty</th>
                        <th class="py-4 text-right pr-6">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr *ngFor="let sale of group.orders" class="hover:bg-gray-50 transition-colors">
                        <td class="py-5 pl-6 font-mono text-xs text-indigo-400 font-bold">#{{ sale.orderId }}</td>
                        <td class="py-5 text-center text-xs font-bold text-gray-500">{{ sale.orderDate | date:'shortDate' }}</td>
                        <td class="py-5 text-xs font-black text-gray-800">{{ sale.product_name }}</td>
                        <td class="py-5 text-center text-xs font-black text-gray-300">x{{ sale.quantity }}</td>
                        <td class="py-5 text-right pr-6 font-black text-emerald-600">+{{ sale.subtotal | currency }}</td>
                      </tr>
                    </tbody>
                  </table>
               </div>
            </div>
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
    .animate-slide-down {
      animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
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
  expandedCategories = signal<Set<string>>(new Set());
  searchTerm = signal<string>('');

  // Grouped and Filtered Sales 
  groupedSales = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filtered = this.sales().filter(s => 
      s.product_name.toLowerCase().includes(term) ||
      String(s.orderId).includes(term) ||
      (s.categoryName || '').toLowerCase().includes(term) ||
      (s.customerName || '').toLowerCase().includes(term)
    );

    const groups: { [key: string]: any[] } = {};
    filtered.forEach(sale => {
      const cat = sale.categoryName || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(sale);
    });
    
    return Object.keys(groups).map(name => ({
      name,
      orders: groups[name],
      totalEarnings: groups[name].reduce((acc, curr) => acc + parseFloat(curr.subtotal), 0)
    }));
  });

  // Compute Category Data dynamically for the graph
  categoryData = computed(() => {
    return this.groupedSales().map(g => ({
      name: g.name,
      value: g.totalEarnings,
      percentage: (g.totalEarnings / (this.summary().totalSales || 1)) * 100
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
      // If admin, show everything! (Case-insensitive check)
      const role = (user.role || '').toLowerCase();
      const sellerId = role === 'admin' ? 'all' : user.id;
      this.sellerService.getOrders(sellerId).subscribe({
        next: (data) => {
          this.sales.set(data.orders || []);
          this.summary.set(data.summary || { totalSales: 0, platformFee: 0, readyForPayout: 0 });
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

  toggleCategory(category: string) {
    const expanded = new Set(this.expandedCategories());
    if (expanded.has(category)) expanded.delete(category);
    else expanded.add(category);
    this.expandedCategories.set(expanded);
  }

  isExpanded(category: string): boolean {
    return this.expandedCategories().has(category);
  }
}
