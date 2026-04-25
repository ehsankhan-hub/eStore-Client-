export interface Product {
  id: number;
  name:string;
  product_name: string;
  product_img: string;
  price: number;
  ratings: number;
  product_description?: string;
  description?: string; // Backend currently sends this field name
  memory_options?: string[] | string | null;
  color_options?: Array<{ name: string; hex: string }> | string | null;
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
  offer_price?: number; // Price after discount
  offer_name?: string; // Name of the active promotion
  discount_pct?: number; // Real discount percentage from the Offers system
  expires_at?: string | null; // Offer expiration timestamp from backend
}
