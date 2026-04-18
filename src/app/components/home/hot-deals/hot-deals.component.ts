import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../services/product/products.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFire, faClock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../../api-url';

@Component({
  selector: 'app-hot-deals',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <section *ngIf="hotDeals.length > 0" class="py-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl my-8 overflow-hidden shadow-sm border border-orange-100">
      <div class="px-6 flex justify-between items-center mb-6">
        <div class="flex items-center">
          <div class="bg-red-600 p-2 rounded-lg mr-4 animate-bounce">
            <fa-icon [icon]="faFire" class="text-white text-xl"></fa-icon>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight uppercase">Limited Time Hot Deals</h2>
            <p class="text-red-600 text-sm font-bold flex items-center">
              <fa-icon [icon]="faClock" class="mr-2"></fa-icon>
              Offers ending soon! Up to 50% off
            </p>
          </div>
        </div>
        <a routerLink="/home/products" class="text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center group">
          View All Deals
          <fa-icon [icon]="faArrowRight" class="ml-2 transform group-hover:translate-x-1 transition-transform"></fa-icon>
        </a>
      </div>

      <div class="flex overflow-x-auto pb-6 px-6 gap-6 scrollbar-hide">
        <div *ngFor="let product of hotDeals" 
             class="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-orange-200 group cursor-pointer"
             [routerLink]="['/home/product', product.id]">
          
          <div class="relative h-48 rounded-t-xl overflow-hidden bg-white p-4">
            <div class="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider">
              -{{ product.discount_pct }}% OFF
            </div>
            
            <img [src]="getImageUrl(product)" 
                 [alt]="product.product_name"
                 class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500">
          </div>

          <div class="p-4">
            <h3 class="text-gray-800 font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{{ product.product_name }}</h3>
            <div class="flex items-baseline space-x-2">
              <span class="text-xl font-black text-red-600">{{ product.offer_price | currency }}</span>
              <span class="text-xs text-gray-400 line-through">{{ product.price | currency }}</span>
            </div>
            <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
               <div class="bg-red-500 h-full w-[70%]" [style.width.%]="(product.discount_pct * 2)"></div>
            </div>
            <p class="text-[10px] text-gray-500 mt-1 font-medium italic">Hurry! Only few left in stock</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class HotDealsComponent implements OnInit {
  hotDeals: any[] = [];
  faFire = faFire;
  faClock = faClock;
  faArrowRight = faArrowRight;

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.productsService.getHotDeals().subscribe({
      next: (deals) => this.hotDeals = deals,
      error: (err) => console.error('Failed to load hot deals', err)
    });
  }

  getImageUrl(product: any): string {
    let imageName = null;
    if (product.galleryImages && product.galleryImages.length > 0) {
      imageName = typeof product.galleryImages[0] === 'string' ? product.galleryImages[0] : product.galleryImages[0].src;
    } else {
      imageName = product.product_img || product.image;
    }

    if (!imageName) return '/assets/images/shop-1.jpg';
    if (imageName.startsWith('http')) return imageName;
    
    // Check if it's a backend upload
    if (imageName.includes('-') && imageName.includes('.')) {
        return `${API_BASE_URL}/uploads/${imageName}`;
    }
    
    return `/assets/images/${imageName}`;
  }
}
