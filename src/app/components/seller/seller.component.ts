import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="seller-layout bg-gray-50 min-h-screen">
      <!-- Seller Header/Navigation could go here -->
      <nav class="bg-indigo-600 p-4 text-white shadow-md flex justify-between">
        <div class="font-bold text-xl">eStore Seller Portal</div>
        <div class="space-x-4">
          <a routerLink="/seller/dashboard" class="hover:underline">Dashboard</a>
          <a routerLink="/seller/products" class="hover:underline">My Products</a>
          <a routerLink="/home/products" class="hover:bg-indigo-700 bg-indigo-500 px-3 py-1 rounded">Return to Store</a>
        </div>
      </nav>
      
      <main class="p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class SellerComponent {}
