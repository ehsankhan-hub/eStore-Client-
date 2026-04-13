import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="seller-layout bg-gray-50 min-h-screen">
      <!-- Seller Header/Navigation -->
      <nav class="bg-indigo-700 p-4 text-white shadow-lg flex justify-between items-center sticky top-0 z-40">
        <div class="flex items-center space-x-2">
          <div class="bg-white text-indigo-700 rounded-full h-8 w-8 flex items-center justify-center font-bold">S</div>
          <div class="font-bold text-xl tracking-tight">Seller Dashboard</div>
        </div>
        
        <div class="hidden md:flex items-center space-x-6">
          <a [routerLink]="['/seller', 'dashboard']" routerLinkActive="text-indigo-200" class="hover:text-indigo-200 transition-colors font-medium cursor-pointer">Dashboard</a>
          <a [routerLink]="['/seller', 'products']" routerLinkActive="text-indigo-200" class="hover:text-indigo-200 transition-colors font-medium cursor-pointer">My Products</a>
          <a [routerLink]="['/seller', 'add-product']" routerLinkActive="text-indigo-200" class="hover:text-indigo-200 transition-colors font-medium cursor-pointer">Add New Product</a>
          <a [routerLink]="['/seller', 'offers']" routerLinkActive="text-indigo-200" class="hover:text-indigo-200 transition-colors font-medium cursor-pointer">Manage Offers</a>
          <div class="h-6 w-px bg-indigo-500 mx-2"></div>
          <a [routerLink]="['/home', 'products']" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm border border-indigo-400 cursor-pointer">
            Return to Store
          </a>
        </div>
        
        <!-- Mobile Menu Icon (Placeholder) -->
        <div class="md:hidden">
          <button class="p-2 hover:bg-indigo-800 rounded">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
          </button>
        </div>
      </nav>
      
      <main class="max-w-7xl mx-auto p-4 md:p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class SellerComponent {}
