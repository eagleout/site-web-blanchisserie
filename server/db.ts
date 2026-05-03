import { eq, desc, and, sql, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, services, serviceItems, deliveryZones, timeSlots, orders, orderItems, addresses } from "../drizzle/schema";
import type { InsertOrder, InsertOrderItem, InsertAddress } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ==================== SERVICES ====================

export async function getActiveServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder));
}

export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).orderBy(asc(services.sortOrder));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function getServiceItemsByServiceId(serviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceItems).where(
    and(eq(serviceItems.serviceId, serviceId), eq(serviceItems.isActive, true))
  ).orderBy(asc(serviceItems.sortOrder));
}

export async function getAllServiceItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceItems).orderBy(asc(serviceItems.sortOrder));
}

export async function updateService(id: number, data: Partial<{ name: string; description: string; basePrice: string; premiumPrice: string; isActive: boolean }>) {
  const db = await getDb();
  if (!db) return;
  await db.update(services).set(data).where(eq(services.id, id));
}

export async function updateServiceItem(id: number, data: Partial<{ name: string; price: string; description: string; isActive: boolean }>) {
  const db = await getDb();
  if (!db) return;
  await db.update(serviceItems).set(data).where(eq(serviceItems.id, id));
}

// ==================== DELIVERY ZONES ====================

export async function getActiveDeliveryZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryZones).where(eq(deliveryZones.isActive, true));
}

export async function getAllDeliveryZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryZones);
}

export async function getDeliveryZoneByPostalCode(postalCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(deliveryZones).where(
    and(eq(deliveryZones.postalCode, postalCode), eq(deliveryZones.isActive, true))
  ).limit(1);
  return result[0];
}

// ==================== TIME SLOTS ====================

export async function getActiveTimeSlots(type: "pickup" | "delivery") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeSlots).where(
    and(eq(timeSlots.slotType, type), eq(timeSlots.isActive, true))
  ).orderBy(asc(timeSlots.dayOfWeek), asc(timeSlots.startTime));
}

export async function getAllTimeSlots() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeSlots).orderBy(asc(timeSlots.slotType), asc(timeSlots.dayOfWeek), asc(timeSlots.startTime));
}

export async function updateTimeSlot(id: number, data: Partial<{ isActive: boolean; maxOrders: number }>) {
  const db = await getDb();
  if (!db) return;
  await db.update(timeSlots).set(data).where(eq(timeSlots.id, id));
}

// ==================== ADDRESSES ====================

export async function getUserAddresses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault));
}

export async function createAddress(data: InsertAddress) {
  const db = await getDb();
  if (!db) return;
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, data.userId));
  }
  const result = await db.insert(addresses).values(data);
  return result;
}

export async function deleteAddress(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
}

// ==================== ORDERS ====================

function generateOrderNumber(): string {
  const prefix = "BLP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function createOrder(data: Omit<InsertOrder, "orderNumber">, items: Omit<InsertOrderItem, "orderId">[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderNumber = generateOrderNumber();
  const [orderResult] = await db.insert(orders).values({ ...data, orderNumber });
  const orderId = orderResult.insertId;
  
  if (items.length > 0) {
    await db.insert(orderItems).values(items.map(item => ({ ...item, orderId })));
  }
  
  return { orderId, orderNumber };
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

export async function getOrderStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, inProgress: 0, delivered: 0, revenue: 0 };
  
  const allOrders = await db.select().from(orders);
  const total = allOrders.length;
  const pending = allOrders.filter(o => o.status === "pending" || o.status === "pickup_scheduled").length;
  const inProgress = allOrders.filter(o => ["picked_up", "cleaning", "delivery_scheduled"].includes(o.status)).length;
  const delivered = allOrders.filter(o => o.status === "delivered").length;
  const revenue = allOrders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + parseFloat(o.total), 0);
  
  return { total, pending, inProgress, delivered, revenue };
}
