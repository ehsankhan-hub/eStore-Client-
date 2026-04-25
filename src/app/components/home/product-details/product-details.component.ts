import { Component, computed, inject, signal } from '@angular/core';
import { RatingsComponent } from '../../ratings/ratings.component';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../services/product/products.service';
import { Product } from '../types/products.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CartStoreItem } from '../services/cart/cart.storeItem';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { API_BASE_URL } from '../../../api-url';

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
  readonly isColorDialogOpen = signal(false);
  readonly productColorOptions = computed(() => this.parseColorOptions(this.product()?.color_options));
  readonly productMemoryOptions = computed(() => this.parseMemoryOptions(this.product()?.memory_options));
  readonly selectedColor = signal<{ name: string; hex: string } | null>(null);
  readonly selectedMemory = signal('');
  readonly descriptionLines = computed(() =>
    this.formatDescription(
      this.product()?.product_description ||
      this.product()?.description ||
      ''
    )
  );
  faShoppingCart = faShoppingCart;
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
          const firstColor = this.productColorOptions()[0];
          const firstMemory = this.productMemoryOptions()[0] || '';
          this.selectedColor.set(firstColor || null);
          this.selectedMemory.set(firstMemory);
        });
      return;
    }
  }

  getImageUrl(imageName: string | undefined): string {
    const raw = String(imageName || '').trim();
    if (!raw || raw === 'undefined' || raw === 'null') {
      return '';
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    const normalized = raw.replace(/\\/g, '/').replace(/^\/+/, '');
    const withoutUploadsPrefix = normalized.replace(/^uploads\//i, '');
    const encodedPath = withoutUploadsPrefix
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');

    return `${API_BASE_URL}/uploads/${encodedPath}`;
  }

  // Get the first image from galleryImages or fallback to product_img
  getMainImage(): string {
    const product = this.product();
    if (product?.galleryImages && Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
      const first = product.galleryImages[0];
      const imageName = typeof first === 'string' ? first : (first?.src || first?.imageFiles || first?.url || first?.path);
      return this.getImageUrl(imageName);
    }
    return this.getImageUrl(product?.product_img);
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null;
    console.warn('Server image not found.', { attemptedSrc: imgElement?.src });
  }

  addToCart() {
    const product = this.product();
    if (product) {
      this.cart.addProduct(product);
    }
  }

  selectColor(color: { name: string; hex: string }): void {
    this.selectedColor.set(color);
  }

  selectMemory(memory: string): void {
    this.selectedMemory.set(memory);
  }

  openColorDialog(): void {
    if (this.productColorOptions().length === 0) return;
    this.isColorDialogOpen.set(true);
  }

  closeColorDialog(): void {
    this.isColorDialogOpen.set(false);
  }

  private formatDescription(description: string): Array<{ type: 'section' | 'bullet' | 'text'; text: string }> {
    return String(description || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        if (this.isSectionLine(line)) {
          return { type: 'section' as const, text: this.cleanSectionText(line) };
        }
        if (this.isBulletLine(line)) {
          return { type: 'bullet' as const, text: this.cleanBulletText(line) };
        }
        return { type: 'text' as const, text: line };
      });
  }

  private isSectionLine(line: string): boolean {
    return (
      /^🔹/.test(line) ||
      /^#{1,6}\s+/.test(line) ||
      /^(overview|key features|specifications|why choose|ideal for)\b/i.test(line)
    );
  }

  private isBulletLine(line: string): boolean {
    return /^[\-*•]\s+/.test(line) || /^(?!🔹)[\u{1F300}-\u{1FAFF}]/u.test(line);
  }

  private cleanSectionText(line: string): string {
    return line.replace(/^🔹\s*/, '').replace(/^#{1,6}\s+/, '').trim();
  }

  private cleanBulletText(line: string): string {
    return line.replace(/^[\-*•]\s+/, '').trim();
  }

  private parseMemoryOptions(value: Product['memory_options']): string[] {
    const parsed = this.parseJsonArray(value);
    if (parsed.length === 0 && typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((option) => option.trim()).filter(Boolean);
    }
    return parsed
      .map((option) => String(option || '').trim())
      .filter(Boolean);
  }

  private parseColorOptions(value: Product['color_options']): Array<{ name: string; hex: string }> {
    const parsed = this.parseJsonArray(value);
    return parsed
      .map((color: any, index: number) => {
        if (typeof color === 'string') {
          const text = color.trim();
          if (/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(text)) {
            return { name: `Color ${index + 1}`, hex: text };
          }
          const parts = text.split(':').map((p) => p.trim());
          if (parts.length === 2 && /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(parts[1])) {
            return { name: parts[0] || `Color ${index + 1}`, hex: parts[1] };
          }
          return { name: text || `Color ${index + 1}`, hex: '#94a3b8' };
        }

        const hex = String(color?.hex || color?.code || '').trim() || '#94a3b8';
        const rawName = String(color?.name || color?.label || '').trim();
        return {
          name: rawName || `Color ${index + 1}`,
          hex,
        };
      })
      .filter((color) => /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color.hex));
  }

  private parseJsonArray(value: unknown): any[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      const maybeBuffer = value as { type?: string; data?: number[] };
      if (maybeBuffer.type === 'Buffer' && Array.isArray(maybeBuffer.data)) {
        try {
          const decoded = new TextDecoder().decode(new Uint8Array(maybeBuffer.data));
          const parsedBuffer = JSON.parse(decoded);
          return Array.isArray(parsedBuffer) ? parsedBuffer : [];
        } catch (error) {
          return [];
        }
      }
      return [];
    }

    if (typeof value !== 'string') {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
}
