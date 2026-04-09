import { Component, inject, signal } from '@angular/core';
import { RatingsComponent } from '../../ratings/ratings.component';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../services/product/products.service';
import { Product } from '../types/products.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CartStoreItem } from '../services/cart/cart.storeItem';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-product-details',
  imports: [RatingsComponent, CommonModule, FontAwesomeModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly cart = inject(CartStoreItem);

  readonly product = signal<Product | null>(null);
  faShoppingCart = faShoppingCart;
  private imageBasePath = '/assets/images/'; // Centralize base path

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id !== null && !isNaN(id)) {
      this.productsService
        .getProduct(id)
        .pipe(takeUntilDestroyed())
        .subscribe((res) => {
          const productData = Array.isArray(res) ? res[0] : res;
          // Process galleryImages if it's a JSON string
          if (productData && productData.galleryImages && typeof productData.galleryImages === 'string') {
            try {
              productData.galleryImages = JSON.parse(productData.galleryImages);
            } catch (e) {
              console.error('Error parsing galleryImages:', e);
              productData.galleryImages = [];
            }
          }
          this.product.set(productData);
        });
      return;
    }
  }

  getImageUrl(imageName: string | undefined): string {
    if (!imageName || imageName === 'undefined' || imageName === undefined || imageName.trim() === '') {
      return `${this.imageBasePath}shop-1.jpg`; // Use existing image as placeholder
    }
    
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    if (imageName.startsWith('uploads/')) {
      return `http://localhost:5004/${imageName}`; // Dynamically proxy backend static uploads
    }
    
    return `${this.imageBasePath}${imageName}`;
  }

  // Get the first image from galleryImages or fallback to product_img
  getMainImage(): string {
    const product = this.product();
    if (product?.galleryImages && Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
      return this.getImageUrl(product.galleryImages[0]);
    }
    // Fallback to product_img if galleryImages is empty
    return this.getImageUrl(product?.product_img);
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null;
    const placeholder = '/assets/images/shop-1.jpg';
    console.warn('Image not found, replaced with placeholder');
    imgElement.src = placeholder;
  }

  addToCart() {
    const product = this.product();
    if (product) {
      this.cart.addProduct(product);
    }
  }
}
