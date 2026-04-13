import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SellerService } from '../../../../services/seller.service';
import { CategoriesStoreItem } from '../../../home/services/category/categories.storeItem';
import { CategoryService } from '../../../home/services/category/category.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [CategoriesStoreItem, CategoryService],
  template: `
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow mt-8">
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold text-gray-800">Onboard New Product</h2>
        <a routerLink="/seller/products" class="text-indigo-600 hover:text-indigo-800">&larr; Back to Products</a>
      </div>

      <form (ngSubmit)="onSubmit()" #productForm="ngForm" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Left Column: Details -->
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Product Title</label>
            <input type="text" [(ngModel)]="title" name="title" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select [(ngModel)]="category" name="category" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="" disabled>Select Category...</option>
              <option *ngFor="let cat of categoryStore.categories()" [value]="cat.id">
                {{ cat.category }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea [(ngModel)]="description" name="description" rows="4" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
        </div>

        <!-- Right Column: Pricing & Images -->
        <div class="space-y-6 bg-gray-50 p-6 rounded-md border border-gray-100">
          
          <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-md">
            <h3 class="text-md font-semibold text-indigo-800 mb-2">Pricing Calculator</h3>
            <div>
              <label class="block text-sm font-medium text-indigo-900">Retail Price ($)</label>
              <input type="number" [(ngModel)]="price" (ngModelChange)="calculateSplit()" name="price" required min="1"
                class="mt-1 block w-full border border-indigo-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            
            <div class="mt-4 pt-4 border-t border-indigo-200">
              <div class="flex justify-between text-sm text-gray-600">
                <span>eStore Commission (10%)</span>
                <span>\${{ commissionFee | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold text-green-700 mt-2">
                <span>Your Estimated Earnings</span>
                <span>\${{ sellerEarnings | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white hover:bg-gray-50 transition-colors">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600 justify-center">
                  <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" multiple class="sr-only" (change)="onFileSelected($event)">
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            <div *ngIf="selectedFiles.length > 0" class="mt-3 text-sm text-gray-600">
              <p class="font-semibold">Selected files:</p>
              <ul class="list-disc pl-5">
                <li *ngFor="let file of selectedFiles">{{ file.name }}</li>
              </ul>
            </div>
          </div>

        </div>

        <div class="md:col-span-2 pt-5 border-t">
          <button type="submit" [disabled]="!productForm.form.valid"
            class="w-full md:w-auto md:float-right flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            Publish Product
          </button>
        </div>
      </form>
    </div>
  `
})
export class AddProductComponent {
  title = '';
  category = '';
  description = '';
  price: number | null = null;
  
  commissionRate = 0.10; // 10% eStore fee
  commissionFee = 0;
  sellerEarnings = 0;

  selectedFiles: File[] = [];

  constructor(
    private router: Router, 
    private sellerService: SellerService,
    public categoryStore: CategoriesStoreItem
  ) {}

  calculateSplit() {
    if (this.price && this.price > 0) {
      this.commissionFee = this.price * this.commissionRate;
      this.sellerEarnings = this.price - this.commissionFee;
    } else {
      this.commissionFee = 0;
      this.sellerEarnings = 0;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('product_name', this.title);
    formData.append('category_id', this.category);
    formData.append('description', this.description || '');
    if (this.price) formData.append('price', String(this.price));
    formData.append('seller_id', '1');

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.sellerService.addProduct(formData).subscribe({
      next: (res) => {
        alert('Product "' + this.title + '" onboarded successfully!');
        this.router.navigate(['/seller/products']);
      },
      error: (err) => {
        console.error('Failed to add product', err);
        alert('Failed to save product. Check console.');
      }
    });
  }
}
