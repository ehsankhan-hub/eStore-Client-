import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold mb-6 text-gray-800">Seller Dashboard</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Metric Cards -->
        <div class="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <h3 class="text-gray-500 text-sm uppercase font-semibold tracking-wider">Total Revenue</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">$0.00</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h3 class="text-gray-500 text-sm uppercase font-semibold tracking-wider">Platform Commission</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">$0.00</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 class="text-gray-500 text-sm uppercase font-semibold tracking-wider">Net Payouts Available</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">$0.00</p>
        </div>
      </div>
      
      <div class="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-bold mb-4 text-gray-800">Recent Transactions</h3>
        <p class="text-gray-500 italic">No transactions yet. Start selling products to see data here!</p>
      </div>
    </div>
  `
})
export class SellerDashboardComponent {}
