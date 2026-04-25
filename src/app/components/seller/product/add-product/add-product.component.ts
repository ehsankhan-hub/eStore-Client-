import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SellerService } from '../../../../services/seller.service';
import { ToastService } from '../../../../services/toast.service';
import { CategoriesStoreItem } from '../../../home/services/category/categories.storeItem';
import { CategoryService } from '../../../home/services/category/category.service';
import { UserService } from '../../../home/services/user/user.service';

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
              <option *ngFor="let cat of categoryStore.categories()" [ngValue]="cat.id">
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
                <span>Your Earnings</span>
                <span>\${{ sellerEarnings | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Promotional Offer Section -->
          <div class="bg-red-50 border border-red-100 p-4 rounded-md">
            <h3 class="text-md font-semibold text-red-800 mb-2 flex items-center">
              <span class="mr-2">🔥</span> Launch with a Deal? (Optional)
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-red-900">Discount (%)</label>
                <input type="number" [(ngModel)]="discount_pct" name="discount_pct" min="0" max="99" placeholder="e.g. 20"
                  class="mt-1 block w-full border border-red-200 rounded-md shadow-sm p-2 bg-white focus:ring-red-500 focus:border-red-500">
              </div>
              <div>
                <label class="block text-xs font-medium text-red-900">Offer Expiry</label>
                <input type="date" [(ngModel)]="expires_at" name="expires_at"
                  class="mt-1 block w-full border border-red-200 rounded-md shadow-sm p-2 bg-white focus:ring-red-500 focus:border-red-500">
              </div>
            </div>
            <p class="text-[10px] text-red-600 mt-2 font-medium italic">* This will place your product in the "Hot Deals" section.</p>
          </div>

          <!-- Variant Options -->
          <div class="bg-white border border-gray-200 p-4 rounded-md">
            <h3 class="text-md font-semibold text-gray-800 mb-3">Product Options</h3>
            <div>
              <label class="block text-sm font-medium text-gray-700">Internal Memory</label>
              <input type="text" [(ngModel)]="memoryOptionsText" name="memoryOptionsText" placeholder="Example: 256 GB, 512 GB, 1 TB"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
              <p class="text-xs text-gray-500 mt-1">Separate multiple memory options with commas.</p>
            </div>

            <div class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Available Colors</label>
                <button type="button" (click)="addColorOption()"
                  class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">+ Add Color</button>
              </div>

              <div class="space-y-2">
                <div *ngFor="let color of colorOptions; let i = index" class="grid grid-cols-[1fr_90px_auto] gap-2 items-center">
                  <input type="text" [(ngModel)]="color.name" [name]="'colorName' + i" placeholder="Color name"
                    class="border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <input type="color" [(ngModel)]="color.hex" [name]="'colorHex' + i"
                    class="h-10 w-full border border-gray-300 rounded-md bg-white p-1 cursor-pointer">
                  <button type="button" (click)="removeColorOption(i)"
                    class="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer">Remove</button>
                </div>
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
  `,
})
export class AddProductComponent {
  title = '';
  category = '';
  description = '';
  price: number | null = null;

  commissionRate = 0.10; // 10% eStore fee
  commissionFee = 0;
  sellerEarnings = 0;

  // New Offer Fields
  discount_pct: number | null = null;
  expires_at: string = '';
  memoryOptionsText = '';
  colorOptions: Array<{ name: string; hex: string }> = [
    { name: 'Black', hex: '#1f2937' },
  ];

  selectedFiles: File[] = [];

  private toast = inject(ToastService);

  constructor(
    private router: Router,
    private sellerService: SellerService,
    private userService: UserService,
    public categoryStore: CategoriesStoreItem
  ) { }

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

  addColorOption() {
    this.colorOptions.push({ name: '', hex: '#94a3b8' });
  }

  removeColorOption(index: number) {
    this.colorOptions.splice(index, 1);
  }

  private getMemoryOptions(): string[] {
    return this.memoryOptionsText
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean);
  }

  private getColorOptions(): Array<{ name: string; hex: string }> {
    return this.colorOptions
      .map((color, index) => {
        const hex = String(color.hex || '').trim() || '#94a3b8';
        const rawName = String(color.name || '').trim();
        return {
          // Keep color even when seller forgets name.
          name: rawName || `Color ${index + 1}`,
          hex,
        };
      })
      .filter((color) => color.hex.length > 0);
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('product_name', this.title);
    formData.append('category_id', this.category);
    formData.append('description', this.description || '');
    if (this.price) formData.append('price', String(this.price));
    formData.append('memory_options', JSON.stringify(this.getMemoryOptions()));
    formData.append('color_options', JSON.stringify(this.getColorOptions()));
    const user = this.userService.loggedInUserInfo();
    if (user && user.id) {
      formData.append('seller_id', String(user.id));
    } else {
      formData.append('seller_id', '1'); // Fallback to 1 if not logged in
    }

    // Include Offer Data if provided
    if (this.discount_pct) formData.append('discount_pct', String(this.discount_pct));
    if (this.expires_at) formData.append('expires_at', this.expires_at);

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.sellerService.addProduct(formData).subscribe({
      next: (res) => {
        this.toast.success('Product "' + this.title + '" onboarded successfully!');
        this.router.navigate(['/seller/products']);
      },
      error: (err) => {
        console.error('Failed to add product', err);
        const msg = err.error?.error || 'Failed to save product details. Please try again.';
        this.toast.error(msg);
      }
    });
  }
}
