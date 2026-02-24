export type ProductCategory =
  | "ALL"
  | "OUTERWEAR"
  | "FOOTWEAR"
  | "BAGS"
  | "ACCESSORIES"
  | "ESSENTIALS";

export interface Product {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: Exclude<ProductCategory, "ALL">;
  accent: string;
  heroImage: string;
  gallery: string[];
  stock: number;
  rating: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface OrderLine {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderCode?: string;
  status?: "PENDING_PAYMENT" | "PLACED" | "FULFILLED" | "CANCELLED";
  userId: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  total: number;
  lines: OrderLine[];
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
}
