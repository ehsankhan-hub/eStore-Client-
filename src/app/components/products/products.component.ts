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
  private imageBasePath = 'assets/images/'; // Centralize base path

  // Mock states for UI features
  wishlistStr = new Set<number>();
  compareList = new Set<number>();

  constructor(
    public productStoreItem: ProductsStoreItem,
    private cart: CartStoreItem
  ) {}

  ngOnInit(): void {}

  getImageUrl(imageName: any | undefined): string {
    if (!imageName) return `${this.imageBasePath}placeholder.png`;
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
    return `${this.imageBasePath}${imageName}`;
  }

  getCurrentImage(product: Product): string {
    const idx = product.currentImageIndex || 0;
    if (product.galleryImages && product.galleryImages[idx]) {
      return product.galleryImages[idx].src;
    }
    return this.getImageUrl(null);
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
    imgElement.src = 'assets/images/placeholder.png';
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  addToCart(product: Product) {
    this.cart.addProduct(product);
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

  isInStock(product: Product): boolean {
    // Mock logic: assume products under $500 are in stock
    return product.price < 500;
  }

  getStockLevel(product: Product): string {
    return this.isInStock(product) ? 'In Stock' : 'Out of Stock';
  }
}

