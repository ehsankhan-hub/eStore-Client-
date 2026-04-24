import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-seller',
   standalone: true,
   imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
   template: `
    <div class="seller-layout bg-[#fcfdfe] min-h-screen relative overflow-hidden lg:flex">
      <!-- High-End Sidebar -->
      <aside [class.w-80]="!isSidebarCollapsed()"
             [class.w-24]="isSidebarCollapsed()"
             class="bg-[#020617] text-white hidden lg:flex flex-col sticky top-0 left-0 h-screen w-[85vw] max-w-[320px] lg:w-auto lg:max-w-none shadow-[10px_0_40px_rgba(0,0,0,0.2)] z-50 transition-all duration-500 ease-in-out border-r border-white/5 relative">
        
        <!-- Toggle Button (Floating) -->
        <button (click)="toggleSidebar()" 
                class="absolute -right-3 top-24 bg-indigo-600 w-6 h-6 rounded-full hidden lg:flex items-center justify-center border-2 border-[#020617] hover:bg-white hover:text-indigo-600 transition-all cursor-pointer z-[60] shadow-xl">
           <svg [class.rotate-180]="isSidebarCollapsed()" class="w-2.5 h-2.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="4" d="M15 19l-7-7 7-7"/></svg>
        </button>

        <!-- Brand Area -->
        <div class="p-6 lg:p-8 border-b border-white/[0.03] bg-white/[0.01]">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 flex-1">
            <div class="bg-gradient-to-tr from-indigo-600 to-indigo-400 h-11 w-11 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xl shadow-[0_10px_20px_rgba(79,70,229,0.3)]">S</div>
            <div *ngIf="!isSidebarCollapsed()" class="overflow-hidden whitespace-nowrap animate-fade-in">
                <span class="font-black text-lg tracking-tight block">Genesis</span>
                <span class="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em]">Registry Admin</span>
            </div>
            </div>
          </div>
        </div>

        <!-- Links -->
        <nav class="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p *ngIf="!isSidebarCollapsed()" class="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] px-4 mb-6 mt-2 animate-fade-in">Operations</p>
          
          <a [routerLink]="['/seller', 'dashboard']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl" 
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <svg class="w-6 h-6 flex-shrink-0 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">Dashboard</span>
          </a>

          <a *ngIf="!isSellerVerified()"
             [routerLink]="['/seller', 'register']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl" 
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <svg class="w-6 h-6 flex-shrink-0 group-hover:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M15 7h3a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3m6-3h-6a2 2 0 00-2 2v1h10V6a2 2 0 00-2-2zm-3 7v4m-2-2h4"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">Register as Seller</span>
          </a>

          <a *ngIf="isSellerVerified()"
             [routerLink]="['/seller', 'payout-settings']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl"
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <svg class="w-6 h-6 flex-shrink-0 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">Payout Settings</span>
          </a>
          
          <a [routerLink]="['/seller', 'products']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl" 
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <svg class="w-6 h-6 flex-shrink-0 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">My Products</span>
          </a>
          
          <a [routerLink]="['/seller', 'add-product']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl" 
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <svg class="w-6 h-6 flex-shrink-0 group-hover:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 4v16m8-8H4"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">Add Product</span>
          </a>

          <div class="h-px bg-white/10 my-6 mx-4"></div>
          <p *ngIf="!isSidebarCollapsed()" class="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] px-4 mb-4 animate-fade-in">Insights & Service</p>

          <!-- Sales Analytics -->
          <a [routerLink]="['/seller', 'analytics']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl" 
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <svg class="w-6 h-6 flex-shrink-0 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">Sales Analytics</span>
          </a>

          <!-- Notification Center -->
          <a [routerLink]="['/seller', 'notifications']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl" 
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <div class="relative">
                <span class="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-[#020617] animate-pulse"></span>
                <svg class="w-6 h-6 flex-shrink-0 group-hover:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
             </div>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">Alerts</span>
          </a>

          <a [routerLink]="['/seller', 'support']" routerLinkActive="bg-white/5 text-white ring-1 ring-white/10 shadow-2xl" 
             class="flex items-center gap-5 px-5 py-4 rounded-2xl border border-transparent hover:bg-white/[0.03] transition-all no-underline text-white/50 font-bold group">
             <svg class="w-6 h-6 flex-shrink-0 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="text-sm tracking-tight whitespace-nowrap animate-fade-in">Concierge</span>
          </a>

          <div class="h-px bg-white/5 my-8 mx-4"></div>

          <a [routerLink]="['/home', 'products']"
             class="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all no-underline font-black text-[10px] uppercase tracking-widest border border-indigo-500/20 group">
             <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
             <span *ngIf="!isSidebarCollapsed()" class="animate-fade-in">Exit Store</span>
          </a>
        </nav>

        <!-- Identity -->
        <div class="p-6">
           <div class="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-all">
              <div class="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-300 font-black text-xs">A</div>
              <div *ngIf="!isSidebarCollapsed()" class="overflow-hidden animate-fade-in">
                 <p class="text-[11px] font-black text-white truncate">Administrator</p>
                 <span class="text-[9px] text-white/30 font-black uppercase tracking-wider block">Live Node</span>
              </div>
           </div>
        </div>
      </aside>

      <!-- Content Shell -->
      <div class="w-full min-w-0 flex-1 flex flex-col h-screen overflow-hidden">
        <header class="h-20 md:h-24 bg-white/80 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-between px-3 md:px-12 sticky top-0 z-40">
           <div class="flex items-center bg-gray-50 px-4 md:px-6 py-3 rounded-2xl w-full max-w-lg border border-gray-100 group transition-all focus-within:bg-white focus-within:shadow-xl focus-within:border-indigo-100">
              <svg class="w-5 h-5 text-gray-300 group-focus-within:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Global Search..." class="bg-transparent border-none outline-none ml-4 text-sm font-bold w-full text-slate-700">
           </div>

           <div class="flex items-center gap-10">
              <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase border border-indigo-100">
                 <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                 Network Active
              </div>
              <button class="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-all">Sign Out</button>
           </div>
        </header>

        <nav class="lg:hidden px-3 py-3 border-b border-gray-100 bg-white overflow-x-auto whitespace-nowrap">
          <div class="inline-flex gap-2 min-w-max">
            <a [routerLink]="['/seller', 'dashboard']" routerLinkActive="bg-indigo-600 text-white" class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold no-underline">Dashboard</a>
            <a *ngIf="!isSellerVerified()" [routerLink]="['/seller', 'register']" routerLinkActive="bg-indigo-600 text-white" class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold no-underline">Register</a>
            <a *ngIf="isSellerVerified()" [routerLink]="['/seller', 'payout-settings']" routerLinkActive="bg-indigo-600 text-white" class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold no-underline">Payout</a>
            <a [routerLink]="['/seller', 'products']" routerLinkActive="bg-indigo-600 text-white" class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold no-underline">Products</a>
            <a [routerLink]="['/seller', 'add-product']" routerLinkActive="bg-indigo-600 text-white" class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold no-underline">Add</a>
          </div>
        </nav>

        <main class="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
           <div class="max-w-[1400px] mx-auto animate-fade-up">
              <router-outlet></router-outlet>
           </div>
        </main>
      </div>
    </div>

    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      aside .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.04); }
    </style>
  `
})
export class SellerComponent {
   isSidebarCollapsed = signal<boolean>(false);
   isSellerVerified = signal<boolean>(false);

   constructor() {
      this.refreshSellerVerification();
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', () => this.refreshSellerVerification());
      }
   }

   private refreshSellerVerification() {
      if (typeof window === 'undefined') return;
      const payoutStatus = String(localStorage.getItem('payoutVerificationStatus') || '').toLowerCase();
      const isStripeConnected = localStorage.getItem('isStripeConnected') === 'true';
      this.isSellerVerified.set(isStripeConnected || payoutStatus === 'verified');
   }

   toggleSidebar() {
      this.isSidebarCollapsed.update((state: any) => !state);
   }

}
