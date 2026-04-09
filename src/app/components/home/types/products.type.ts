export interface Product {
  id: number;
  name:string;
  product_name: string;
  product_img: string;
  price: number;
  ratings: number;
  product_description: string;
  category_id: number;
  galleryImages: any[] | undefined; // Array of images for this product
  currentImageIndex?: number;
  stock?: number; // Product stock quantity
  discount?: number; // Discount percentage (0-100)
  reviewCount?: number; // Number of reviews
  brand?: string; // Product brand/manufacturer
  sku?: string; // Product SKU
  shippingInfo?: string; // Shipping information
  isBestSeller?: boolean; // Best seller badge
  isNewArrival?: boolean; // New arrival badge
  freeShipping?: boolean; // Free shipping indicator
  quickViewAvailable?: boolean; // Quick view functionality
}
