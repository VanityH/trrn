import type { User, Product, Order, OrderStatus, DashboardStats, ApiResult } from "./types.ts";
import { initialUsers, initialProducts, initialOrders } from "./data.ts";

// ── Delay simulation ───────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── In-memory store ────────────────────────────────────────────

let users: User[] = [...initialUsers];
let products: Product[] = [...initialProducts];
let orders: Order[] = [...initialOrders];
let nextUserId = initialUsers.length + 1;
let nextProductId = initialProducts.length + 1;

function ok<T>(data: T): ApiResult<T> {
  return { data, ok: true };
}

function err(msg: string): ApiResult<never> {
  return { message: msg, ok: false };
}

// ── Auth ───────────────────────────────────────────────────────

let currentUser: User | null = users[0]; // 默认已登录

export async function login(email: string): Promise<ApiResult<User>> {
  await delay(500);
  const user = users.find((u) => u.email === email);
  if (!user) return err("User not found");
  if (user.status === "inactive") return err("Account is disabled");
  currentUser = user;
  return ok(user);
}

export async function logout(): Promise<ApiResult<null>> {
  await delay(200);
  currentUser = null;
  return ok(null);
}

export function getSession(): User | null {
  return currentUser;
}

// ── Dashboard ──────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<ApiResult<DashboardStats>> {
  await delay();
  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const revenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  return ok({
    totalUsers: users.length,
    activeUsers,
    totalProducts: products.filter((p) => p.status === "active").length,
    totalOrders,
    revenue,
    pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
  });
}

// ── Users CRUD ─────────────────────────────────────────────────

export async function fetchUsers(): Promise<ApiResult<User[]>> {
  await delay();
  return ok([...users]);
}

export async function createUser(data: Omit<User, "id" | "created">): Promise<ApiResult<User>> {
  await delay(400);
  if (!data.name || !data.email) return err("Name and email are required");
  if (users.some((u) => u.email === data.email)) return err("Email already exists");
  const user: User = { ...data, id: nextUserId++, created: new Date().toISOString().slice(0, 10) };
  users = [...users, user];
  return ok(user);
}

export async function updateUser(
  id: number,
  data: Partial<Omit<User, "id" | "created">>,
): Promise<ApiResult<User>> {
  await delay(400);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return err("User not found");
  const updated: User = { ...users[idx], ...data };
  users = [...users.slice(0, idx), updated, ...users.slice(idx + 1)];
  return ok(updated);
}

export async function deleteUser(id: number): Promise<ApiResult<null>> {
  await delay(300);
  if (!users.some((u) => u.id === id)) return err("User not found");
  users = users.filter((u) => u.id !== id);
  return ok(null);
}

// ── Products CRUD ──────────────────────────────────────────────

export async function fetchProducts(): Promise<ApiResult<Product[]>> {
  await delay();
  return ok([...products]);
}

export async function createProduct(
  data: Omit<Product, "id" | "created">,
): Promise<ApiResult<Product>> {
  await delay(400);
  if (!data.name) return err("Product name is required");
  const product: Product = {
    ...data,
    id: nextProductId++,
    created: new Date().toISOString().slice(0, 10),
  };
  products = [...products, product];
  return ok(product);
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<Product, "id" | "created">>,
): Promise<ApiResult<Product>> {
  await delay(400);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return err("Product not found");
  const updated: Product = { ...products[idx], ...data };
  products = [...products.slice(0, idx), updated, ...products.slice(idx + 1)];
  return ok(updated);
}

export async function deleteProduct(id: number): Promise<ApiResult<null>> {
  await delay(300);
  if (!products.some((p) => p.id === id)) return err("Product not found");
  products = products.filter((p) => p.id !== id);
  return ok(null);
}

// ── Orders CRUD ────────────────────────────────────────────────

export async function fetchOrders(): Promise<ApiResult<Order[]>> {
  await delay(300);
  return ok([...orders]);
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<ApiResult<Order>> {
  await delay(400);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return err("Order not found");
  const updated: Order = { ...orders[idx], status };
  orders = [...orders.slice(0, idx), updated, ...orders.slice(idx + 1)];
  return ok(updated);
}

export async function deleteOrder(id: number): Promise<ApiResult<null>> {
  await delay(300);
  if (!orders.some((o) => o.id === id)) return err("Order not found");
  orders = orders.filter((o) => o.id !== id);
  return ok(null);
}

// ── Contact form simulation ────────────────────────────────────

export async function submitContactForm(_data: {
  name: string;
  email: string;
  message: string;
}): Promise<ApiResult<{ id: number }>> {
  await delay(600);
  // 模拟：偶尔返回失败
  if (Math.random() < 0.1) return err("Server error, please try again");
  return ok({ id: Date.now() });
}
