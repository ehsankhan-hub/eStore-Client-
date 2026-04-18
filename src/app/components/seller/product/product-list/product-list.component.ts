import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../../../services/seller.service';
import { ToastService } from '../../../../services/toast.service';
import { CategoriesStoreItem } from '../../../home/services/category/categories.storeItem';
import { CategoryService } from '../../../home/services/category/category.service';
import { UserService } from '../../../home/services/user/user.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [CategoriesStoreItem, CategoryService],
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
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <ng-container *ngIf="products.length > 0; else emptyState">
              <tr *ngFor="let product of products">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ product.product_name }}</div>
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
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="onEdit(product)" class="text-indigo-600 hover:text-indigo-900 mx-2 cursor-pointer font-bold">Edit</button>
                  <button (click)="onDelete(product.id)" class="text-red-600 hover:text-red-900 cursor-pointer font-bold">Delete</button>
                </td>
              </tr>
            </ng-container>
            
            <ng-template #emptyState>
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  <p *ngIf="!loading">You haven't onboarded any products yet.</p>
                  <p *ngIf="loading">Loading your products...</p>
                </td>
              </tr>
            </ng-template>
          </tbody>
        </table>
      </div>

      <!-- Custom Edit Modal (Refined 3-Column Layout) -->
      @if (isEditModalOpen) {
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm p-4">
        <div class="relative flex flex-col border w-full max-w-6xl max-h-[90vh] shadow-2xl rounded-2xl bg-white animate-in fade-in zoom-in duration-300 overflow-hidden">
          
          <!-- Fixed Header -->
          <div class="bg-gray-50 px-8 py-5 border-b flex justify-between items-center shrink-0">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Configure Product</h3>
              <p class="text-sm text-gray-500">Optimizing details, pricing, and visibility</p>
            </div>
            <button (click)="isEditModalOpen = false" class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form id="editProductForm" (submit)="saveEdit($event)">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <!-- Col 1: Core Details -->
                <div class="space-y-6">
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Core Details</h4>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Product Title</label>
                    <input type="text" [(ngModel)]="editingProduct.product_name" name="product_name" required
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select [(ngModel)]="editingProduct.category_id" name="category_id" required
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-white">
                      <option *ngFor="let cat of categoryStore.categories()" [ngValue]="cat.id">
                        {{ cat.category }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea [(ngModel)]="editingProduct.description" name="description" rows="6" required
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"></textarea>
                  </div>
                </div>

                <!-- Col 2: Inventory & Financials -->
                <div class="space-y-6">
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Financials & Inventory</h4>
                  
                  <!-- Pricing Splitter -->
                  <div class="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-sm">
                    <h5 class="text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wider">Pricing Calculator</h5>
                    <div>
                      <label class="block text-xs font-semibold text-indigo-700 mb-1">Selling Price (\$)</label>
                      <div class="relative">
                        <span class="absolute left-3 top-2.5 text-gray-400 font-bold">\$</span>
                        <input type="number" [(ngModel)]="editingProduct.price" (ngModelChange)="calculateSplit()" name="price" required
                          class="w-full border border-indigo-200 rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 bg-white outline-none font-semibold">
                      </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-indigo-200 space-y-3">
                      <div class="flex justify-between text-[11px] font-medium text-gray-500">
                        <span>eStore Fee (10%)</span>
                        <span>\${{ commissionFee | number:'1.2-2' }}</span>
                      </div>
                      <div class="flex justify-between items-center bg-white p-2.5 rounded-lg border border-indigo-100">
                        <span class="text-xs font-bold text-gray-600">Net Earnings</span>
                        <span class="text-lg font-black text-green-600">\${{ sellerEarnings | number:'1.2-2' }}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Available Stock</label>
                    <input type="number" [(ngModel)]="editingProduct.stock_quantity" name="stock_quantity"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                  </div>
                </div>

                <!-- Col 3: Media & Growth -->
                <div class="space-y-6">
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Media & Growth</h4>
                  
                  <!-- Launch with a Deal? (Offer) -->
                  <div class="bg-rose-50 border border-rose-100 p-5 rounded-xl shadow-sm">
                    <h5 class="text-xs font-bold text-rose-800 mb-3 flex items-center uppercase tracking-wider">
                      <span class="mr-2 text-base">✨</span> Active Deals
                    </h5>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-xs font-semibold text-rose-900 mb-1">Discount Percentage</label>
                        <div class="relative">
                          <input type="number" [(ngModel)]="editingProduct.discount_pct" name="discount_pct" placeholder="0"
                            class="w-full border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 outline-none pr-8 bg-white">
                          <span class="absolute right-3 top-2 text-rose-400">%</span>
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-semibold text-rose-900 mb-1">End Date</label>
                        <input type="date" [(ngModel)]="editingProduct.expires_at" name="expires_at"
                          class="w-full border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 outline-none bg-white">
                      </div>
                    </div>
                  </div>

                  <!-- Image Upload -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Assets</label>
                    <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-white hover:border-indigo-400 transition-all text-center group">
                      <div class="flex flex-col items-center">
                        <div class="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <svg class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <label class="cursor-pointer">
                          <span class="text-sm font-bold text-gray-700 hover:text-indigo-600">Select Files</span>
                          <input type="file" multiple class="hidden" (change)="onFileSelected(\$event)">
                        </label>
                        <p class="text-[10px] text-gray-400 mt-2 italic">Multi-image support active</p>
                      </div>
                    </div>
                    @if (selectedFiles.length > 0) {
                      <div class="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg text-green-700 text-[11px] font-bold border border-green-100 animate-pulse">
                        <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        {{ selectedFiles.length }} New assets staged
                      </div>
                    }
                  </div>

                </div>
              </div>
            </form>
          </div>

          <!-- Fixed Footer -->
          <div class="bg-gray-50 px-8 py-5 border-t flex justify-between items-center shrink-0">
            <p class="text-[10px] text-gray-400 max-w-[200px]">Note: Changes are immediate after submission.</p>
            <div class="flex space-x-3">
              <button type="button" (click)="isEditModalOpen = false" 
                class="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                Discard Changes
              </button>
              <button type="submit" form="editProductForm" [disabled]="saving" 
                class="px-10 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all disabled:opacity-50 flex items-center group">
                @if (saving) {
                  <span class="mr-2 animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                }
                <span class="group-hover:translate-x-0.5 transition-transform">{{ saving ? 'Syncing...' : 'Commit Updates' }}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      }

      <!-- Custom Animated Delete Confirmation -->
      @if (isDeleteConfirmOpen) {
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 z-[60] flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300 border border-gray-100">
          
          <!-- Danger Header -->
          <div class="bg-rose-50 p-6 flex flex-col items-center border-b border-rose-100">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce">
              <svg class="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-xl font-black text-rose-900">Are you absolutely sure?</h3>
            <p class="text-xs text-rose-700 mt-2 text-center font-semibold leading-relaxed px-4">This action is permanent. All product data, high-resolution images, and active deals will be deleted from the system.</p>
          </div>

          <!-- Actions -->
          <div class="p-6 bg-white flex flex-col gap-3">
            <button (click)="confirmDelete()" [disabled]="deleting"
              class="w-full py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center group">
              @if (deleting) {
                <span class="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              }
              <span class="group-hover:scale-105 transition-transform">{{ deleting ? 'Purging Assets...' : 'Yes, Delete Permanently' }}</span>
            </button>
            <button (click)="cancelDelete()" 
              class="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm uppercase tracking-wider">
              No, Keep Product
            </button>
          </div>
          
          <!-- Bottom Accent Bar -->
          <div class="h-2 w-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-500"></div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; padding: 2rem 0; }
  `]
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  loading = true;
  saving = false;

  // Pricing splitting (matching AddProduct)
  commissionRate = 0.10;
  commissionFee = 0;
  sellerEarnings = 0;
  selectedFiles: File[] = [];

  private toast = inject(ToastService);
  private sellerService = inject(SellerService);
  public categoryStore = inject(CategoriesStoreItem);
  private userService = inject(UserService);

  // Modal State
  isEditModalOpen = false;
  isDeleteConfirmOpen = false;
  editingProduct: any = {};
  productToDeleteId: number | null = null;
  deleting = false;

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading = true;
    const user = this.userService.loggedInUserInfo();
    const sellerId = user?.id || 1;
    this.sellerService.getProducts(sellerId).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading = false;
        this.toast.error('Error loading products from server.');
      }
    });
  }

  onEdit(product: any) {
    this.editingProduct = { ...product }; // Shallow copy
    this.selectedFiles = []; // Reset file selection
    
    // Format date for <input type="date"> (YYYY-MM-DD)
    if (this.editingProduct.expires_at) {
      this.editingProduct.expires_at = new Date(this.editingProduct.expires_at).toISOString().split('T')[0];
    }
    
    this.calculateSplit();
    this.isEditModalOpen = true;
  }

  calculateSplit() {
    const price = Number(this.editingProduct.price);
    if (price && price > 0) {
      this.commissionFee = price * this.commissionRate;
      this.sellerEarnings = price - this.commissionFee;
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

  saveEdit(event: Event) {
    event.preventDefault();
    this.saving = true;

    const formData = new FormData();
    formData.append('product_name', this.editingProduct.product_name || '');
    formData.append('category_id', String(this.editingProduct.category_id || ''));
    formData.append('description', this.editingProduct.description || '');
    formData.append('price', String(this.editingProduct.price || 0));
    formData.append('stock_quantity', String(this.editingProduct.stock_quantity || 0));
    
    // Offer data
    if (this.editingProduct.discount_pct) {
      formData.append('discount_pct', String(this.editingProduct.discount_pct));
    }
    if (this.editingProduct.expires_at) {
      formData.append('expires_at', this.editingProduct.expires_at);
    }

    // New images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.sellerService.updateProduct(this.editingProduct.id, formData).subscribe({
      next: () => {
        this.isEditModalOpen = false;
        this.saving = false;
        this.fetchProducts(); // Refresh list
        this.toast.success('Product updated successfully!');
      },
      error: (err) => {
        console.error('Error updating product', err);
        this.saving = false;
        const msg = err.error?.error || 'Failed to update product details.';
        this.toast.error(msg);
      }
    });
  }

  onDelete(productId: number) {
    this.productToDeleteId = productId;
    this.isDeleteConfirmOpen = true;
  }

  confirmDelete() {
    if (!this.productToDeleteId) return;
    
    this.deleting = true;
    this.sellerService.deleteProduct(this.productToDeleteId).subscribe({
      next: () => {
        this.isDeleteConfirmOpen = false;
        this.deleting = false;
        this.productToDeleteId = null;
        this.fetchProducts(); // Refresh list
        this.toast.success('Product removed permanently.');
      },
      error: (err) => {
        console.error('Error deleting product', err);
        this.deleting = false;
        this.isDeleteConfirmOpen = false;
        const msg = err.error?.error || 'Failed to delete product. It might have active orders.';
        this.toast.error(msg);
      }
    });
  }

  cancelDelete() {
    this.isDeleteConfirmOpen = false;
    this.productToDeleteId = null;
  }

  calculateEarnings(price: number): number {
    return price ? price * 0.9 : 0; // 90% goes to seller
  }
}
