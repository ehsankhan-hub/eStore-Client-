import { Injectable } from '@angular/core';
import { Product } from '../../types/products.type';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventory = new Map<number, number>();
  private productData = new Map<number, Partial<Product>>();

  constructor() {
    this.initializeInventory();
    this.initializeProductData();
  }

  private initializeInventory() {
    // Initialize with some sample stock values
    // In a real app, this would come from an API
    const sampleStock: { [key: number]: number } = {
      1: 10, // Product ID 1 has 10 units
      2: 5,  // Product ID 2 has 5 units
      3: 0,  // Product ID 3 is out of stock
      4: 15, // Product ID 4 has 15 units
      5: 8,  // Product ID 5 has 8 units
      6: 12, // Product ID 6 has 12 units
    };

    Object.entries(sampleStock).forEach(([productId, stock]) => {
      this.inventory.set(parseInt(productId), stock);
    });
  }

  private initializeProductData() {
    // Sample product data for enhanced features
    const sampleData: { [key: number]: Partial<Product> } = {
      1: {
        brand: 'Samsung',
        sku: 'SAM-GALAXY-S21',
        shippingInfo: '2-3 business days',
        isBestSeller: true,
        freeShipping: true,
        quickViewAvailable: true,
        discount: 15,
        reviewCount: 234
      },
      2: {
        brand: 'Apple',
        sku: 'APP-IPHONE-13',
        shippingInfo: '1-2 business days',
        isNewArrival: true,
        freeShipping: false,
        quickViewAvailable: true,
        reviewCount: 567
      },
      3: {
        brand: 'Sony',
        sku: 'SONY-WH-1000',
        shippingInfo: '3-5 business days',
        discount: 25,
        freeShipping: true,
        quickViewAvailable: true,
        reviewCount: 123
      },
      4: {
        brand: 'Nike',
        sku: 'NIKE-AIR-MAX',
        shippingInfo: '2-4 business days',
        isBestSeller: true,
        freeShipping: true,
        quickViewAvailable: true,
        reviewCount: 890
      },
      5: {
        brand: 'Adidas',
        sku: 'ADI-ULTRABOOST',
        shippingInfo: '1-3 business days',
        isNewArrival: true,
        freeShipping: true,
        quickViewAvailable: true,
        discount: 10,
        reviewCount: 456
      },
      6: {
        brand: 'LG',
        sku: 'LG-OLED-TV',
        shippingInfo: '5-7 business days',
        freeShipping: false,
        quickViewAvailable: true,
        reviewCount: 78
      }
    };

    Object.entries(sampleData).forEach(([productId, data]) => {
      this.productData.set(parseInt(productId), data);
    });
  }

  getStock(productId: number): number {
    return this.inventory.get(productId) || 0;
  }

  isInStock(productId: number): boolean {
    return this.getStock(productId) > 0;
  }

  decreaseStock(productId: number, quantity: number = 1): boolean {
    const currentStock = this.getStock(productId);
    if (currentStock >= quantity) {
      this.inventory.set(productId, currentStock - quantity);
      return true;
    }
    return false;
  }

  increaseStock(productId: number, quantity: number): void {
    const currentStock = this.getStock(productId);
    this.inventory.set(productId, currentStock + quantity);
  }

  setStock(productId: number, stock: number): void {
    this.inventory.set(productId, Math.max(0, stock));
  }

  // Get product data for enhanced features
  getProductData(productId: number): Partial<Product> {
    return this.productData.get(productId) || {};
  }

  // For demo purposes - reset inventory
  resetInventory(): void {
    this.initializeInventory();
  }
}
