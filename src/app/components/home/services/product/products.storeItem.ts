import { Injectable, WritableSignal, signal } from '@angular/core';
import { Product } from '../../types/products.type';
import { ProductsService } from './products.service';

@Injectable()
export class ProductsStoreItem {
  // private readonly _products = signal<Product[]>([]);
  // readonly products = this._products.asReadonly();
  products: WritableSignal<Product[]> = signal([]);
  // productsSignal = signal<Product[]>([]);

  private readonly _products = signal<Product[]>([]);
  //readonly products = this._products.asReadonly();
 private imageBasePath = 'assets/images/'; // Centralize base path

  constructor(private productsService: ProductsService) {
    this.loadProducts();
  }

  loadProducts(filters?: {
    maincategoryid?: number;
    subcategoryid?: number;
    keyword?: string;
  }): void {
    this.productsService.getAllProducts(filters).subscribe((products) => {
      // Process each product's galleryImages if they arrive as JSON strings from MySQL
      const processedProducts = products.map(p => {
        if (p.galleryImages && typeof p.galleryImages === 'string') {
          try {
            p.galleryImages = JSON.parse(p.galleryImages);
          } catch (e) {
            console.error(`Error parsing galleryImages for product ${p.id}:`, e);
            p.galleryImages = [];
          }
        }
        return p;
      });
      console.log('Processed products', processedProducts);
      this.products.set(processedProducts);
    });
  }
}
