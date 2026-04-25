import { Component, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingsComponent } from '../ratings/ratings.component';
import { ProductsStoreItem } from '../home/services/product/products.storeItem';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxOpen, faShoppingCart, faStar, faBolt, faTruck, faHeart, faEye, faTag, faCheckCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { CartStoreItem } from '../home/services/cart/cart.storeItem';
import { Product } from '../home/types/products.type';
import { API_BASE_URL } from '../../api-url';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RatingsComponent, FontAwesomeModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  // Font Awesome Icons
  faBoxOpen = faBoxOpen;
  faShoppingCart = faShoppingCart;
  faStar = faStar;
  faBolt = faBolt;
  faTruck = faTruck;
  faHeart = faHeart;
  faEye = faEye;
  faTag = faTag;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  productsSignal = signal<Product[]>([]);
  // Mock states for UI features
  wishlistStr = new Set<number>();
  compareList = new Set<number>();

  constructor(
    public productStoreItem: ProductsStoreItem,
    private cart: CartStoreItem
  ) { }

  ngOnInit(): void { }

  getImageUrl(imageName: any | undefined): string {
    const rawInput = String(imageName || '').trim();
    if (!rawInput || rawInput === 'undefined' || rawInput === 'null') {
      return '';
    }

    if (rawInput.startsWith('http://') || rawInput.startsWith('https://')) {
      return rawInput;
    }

    const raw = rawInput.replace(/\\/g, '/').replace(/^\/+/, '');
    const withoutUploadsPrefix = raw.replace(/^uploads\//i, '');
    const encodedPath = withoutUploadsPrefix
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');

    return `${API_BASE_URL}/uploads/${encodedPath}`;
  }

  getCurrentImage(product: Product): string {
    const idx = product.currentImageIndex || 0;
    if (product.galleryImages && product.galleryImages[idx]) {
      const img = product.galleryImages[idx];
      const imageName = typeof img === 'string' ? img : (img?.src || img?.imageFiles || img?.url || img?.path);
      return this.getImageUrl(imageName);
    }
    return this.getImageUrl((product as any)?.product_img);
  }

  changeProductImage(product: Product, newIndex: number): void {
    this.productStoreItem.products.update(currentProducts =>
      currentProducts.map(p =>
        p.id === product.id ? { ...p, currentImageIndex: newIndex } : p
      )
    );
  }

  onImageError(event: Event, product: Product, imageIndex: number) {
    const imgElement = event.target as HTMLImageElement;
    
    // Prevent infinite loop by disabling further error handling on this element
    imgElement.onerror = null; 
    
    console.warn('Server image failed to load.', {
      productId: product?.id,
      imageIndex,
      attemptedSrc: imgElement?.src
    });
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  addToCart(product: Product) {
    const totalStock = (product as any).stock_quantity ?? product.stock ?? 0;
    const inCart = this.cart.getQuantityInCart(product.id);

    if (inCart < totalStock) {
      this.cart.addProduct(product);
    } else {
      alert(`Maximum stock reached for ${product.name}. Only ${totalStock} available.`);
    }
  }

  // --- NEW METHODS TO SUPPORT ADVANCED HTML TEMPLATE ---

  getEnhancedProduct(product: Product): any {
    // Adds mock data for badges and features missing from base Product type
    return {
      ...product,
      discount: product.price > 100 ? 15 : 0,
      isBestSeller: product.ratings > 4.5,
      isNewArrival: product.id > 10,
      freeShipping: product.price > 50,
      brand: 'Premium Brand',
      sku: `PROD-${product.id}`,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      shippingInfo: 'Ships in 2-3 days',
      quickViewAvailable: true
    };
  }

  toggleWishlist(product: Product) {
    if (this.wishlistStr.has(product.id)) {
      this.wishlistStr.delete(product.id);
    } else {
      this.wishlistStr.add(product.id);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistStr.has(productId);
  }

  openQuickView(item: any) {
    console.log('Quick view triggered for:', item);
    // Future: Open a modal dialog here
  }

  toggleComparison(product: Product) {
    if (this.compareList.has(product.id)) {
      this.compareList.delete(product.id);
    } else {
      this.compareList.add(product.id);
    }
  }

  isInComparison(productId: number): boolean {
    return this.compareList.has(productId);
  }

  getStarRating(product: Product): number {
    return Math.floor(product.ratings);
  }

  getReviewCount(product: Product): number {
    return (product as any).reviewCount || 24; // Mock value
  }

  isLastDayOffer(product: Product): boolean {
    if (!product?.expires_at || !(product.discount_pct && product.discount_pct > 0)) {
      return false;
    }

    const expiry = new Date(product.expires_at);
    if (Number.isNaN(expiry.getTime())) {
      return false;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const dayDiff = Math.round((expiryDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    // Treat both "today" and "tomorrow" as final urgency window.
    return dayDiff >= 0 && dayDiff <= 1;
  }

  isInStock(product: Product): boolean {
    const totalStock = (product as any).stock_quantity ?? product.stock ?? 0;
    const inCart = this.cart.getQuantityInCart(product.id);
    return (totalStock - inCart) > 0;
  }

  getStockLevel(product: Product): string {
    const totalStock = (product as any).stock_quantity ?? product.stock ?? 0;
    const inCart = this.cart.getQuantityInCart(product.id);
    const available = totalStock - inCart;

    if (totalStock > 0) {
      return available > 0 ? `${available} in stock` : 'Out of stock';
    }
    return 'Out of Stock';
  }
}
