import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../../services/seller.service';
import { UserService } from '../../home/services/user/user.service';

@Component({
  selector: 'app-seller-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800">Manage Offers</h2>
          <p class="text-gray-500 mt-1">Boost your sales with limited-time discounts and deals.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Create Offer Form -->
        <div class="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span class="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
            Create New Offer
          </h3>

          <form (ngSubmit)="onCreateOffer()" #offerForm="ngForm" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Select Product</label>
              <select [(ngModel)]="newOffer.productId" name="productId" required
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                <option value="" disabled>Choose a product...</option>
                <option *ngFor="let prod of myProducts" [value]="prod.id">
                  {{ prod.product_name }} ($ {{ prod.price }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Offer Name (e.g. Summer Sale)</label>
              <input type="text" [(ngModel)]="newOffer.offer_name" name="offer_name" required
                placeholder="Ex: Flash Deal, Festive Discount"
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Discount (%)</label>
                <input type="number" [(ngModel)]="newOffer.discount_pct" name="discount_pct" required min="1" max="99"
                  class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <input type="date" [(ngModel)]="newOffer.expires_at" name="expires_at" required
                  class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
              </div>
            </div>

            <button type="submit" [disabled]="!offerForm.form.valid"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
              Launch Offer
            </button>
          </form>
        </div>

        <!-- Active Offers List -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-800">Current Promotional Offers</h3>
              <span class="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                {{ activeOffers.length }} Active
              </span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left bg-white">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Offer Details</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Discounted Price</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let offer of activeOffers" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-bold text-gray-900">{{ offer.product_name }}</div>
                      <div class="text-xs text-gray-400">Regular: $ {{ offer.original_price }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {{ offer.offer_name }}: -{{ offer.discount_pct }}%
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      $ {{ calculateOfferPrice(offer.original_price, offer.discount_pct) | number:'1.2-2' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ offer.expires_at ? (offer.expires_at | date:'mediumDate') : 'No Expiry' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button (click)="onDeleteOffer(offer.id)" class="text-red-500 hover:text-red-700 transition-colors font-medium">
                        End Early
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="activeOffers.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-gray-400">
                      No active offers found. Start by creating one!
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OffersComponent implements OnInit {
  myProducts: any[] = [];
  activeOffers: any[] = [];

  newOffer = {
    productId: '',
    offer_name: '',
    discount_pct: 0,
    expires_at: ''
  };

  constructor(
    private sellerService: SellerService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.userService.loggedInUserInfo();
    const sellerId = user?.id || 1;
    this.sellerService.getProducts(sellerId).subscribe(data => this.myProducts = data);
    this.sellerService.getOffers(sellerId).subscribe(data => this.activeOffers = data);
  }

  calculateOfferPrice(original: any, discount: number): number {
    const price = typeof original === 'string' ? parseFloat(original.replace(/[^0-9.-]/g, '')) : original;
    return price * (1 - discount / 100);
  }

  onCreateOffer() {
    this.sellerService.createOffer(this.newOffer).subscribe({
      next: () => {
        alert('Offer launched successfully!');
        this.newOffer = { productId: '', offer_name: '', discount_pct: 0, expires_at: '' };
        this.loadData();
      },
      error: (err) => console.error('Failed to create offer', err)
    });
  }

  onDeleteOffer(id: number) {
    if (confirm('Are you sure you want to end this offer?')) {
      this.sellerService.deleteOffer(id).subscribe(() => this.loadData());
    }
  }
}
