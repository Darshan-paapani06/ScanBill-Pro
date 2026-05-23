export interface Product {
  barcode_value: string;
  product_name: string;
  price: number;
  stock_quantity: number;
  image_url: string;
}

export interface ScanLog {
  id: string;
  barcode: string;
  timestamp: string;
  product_name: string | null;
  price: number | null;
  source: string;
  status: "SUCCESS" | "UNKNOWN_CODE";
}

export interface CartItem {
  barcode_value: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
  max_stock: number;
}

export interface TransactionItem {
  barcode_value: string;
  product_name: string;
  quantity: number;
  price: number;
}

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Transaction {
  id: string;
  receipt_number: string;
  cashier_name: string;
  subtotal: number;
  tax: number;
  grand_total: number;
  payment_method: string;
  payment_status: PaymentStatus;
  items: TransactionItem[];
  timestamp: string;
}

export type UserRole = "cashier" | "admin";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  created_at: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

