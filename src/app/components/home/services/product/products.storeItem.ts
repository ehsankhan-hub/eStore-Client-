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
      console.log('products',products);
      this.products.set(products);
    });
  }
}
