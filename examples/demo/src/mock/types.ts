// ── Mock domain types ──────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  created: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  created: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
}

// ── Mock API response ──────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  ok: true;
}

export interface ApiError {
  message: string;
  ok: false;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
