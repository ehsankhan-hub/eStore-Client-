import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerService } from '../../../../services/seller.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">My Products</h2>
        <a routerLink="/seller/add-product" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow">
          + Onboard New Product
        </a>
      </div>
      
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Earnings</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <ng-container *ngIf="products.length > 0; else emptyState">
              <tr *ngFor="let product of products">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ product.id }} | Cat: {{ product.category_id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  \${{ product.price }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  \${{ calculateEarnings(product.price) | number:'1.2-2' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800" *ngIf="product.is_active">
                    Active
                  </span>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800" *ngIf="!product.is_active">
                    Inactive
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" class="text-indigo-600 hover:text-indigo-900 mx-2">Edit</a>
                  <a href="#" class="text-red-600 hover:text-red-900">Delete</a>
                </td>
              </tr>
            </ng-container>
            
            <ng-template #emptyState>
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <p *ngIf="!loading">You haven't onboarded any products yet.</p>
                  <p *ngIf="loading">Loading your products...</p>
                </td>
              </tr>
            </ng-template>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  loading = true;

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    // Assuming seller ID is 1 for testing
    this.sellerService.getProducts(1).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading = false;
      }
    });
  }

  calculateEarnings(price: number): number {
    return price ? price * 0.9 : 0; // 90% goes to seller
  }
}
