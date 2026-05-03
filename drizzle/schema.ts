import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Services offered (lavage, repassage, nettoyage à sec, etc.)
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  category: mysqlEnum("category", ["washing", "ironing", "dry_cleaning", "household"]).notNull(),
  pricingType: mysqlEnum("pricingType", ["per_kg", "per_item"]).notNull().default("per_kg"),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  premiumPrice: decimal("premiumPrice", { precision: 10, scale: 2 }),
  minWeight: decimal("minWeight", { precision: 5, scale: 1 }).default("3.0"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Service items (articles individuels avec prix unitaire)
 */
export const serviceItems = mysqlTable("service_items", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ServiceItem = typeof serviceItems.$inferSelect;
export type InsertServiceItem = typeof serviceItems.$inferInsert;

/**
 * Delivery zones (zones desservies)
 */
export const deliveryZones = mysqlTable("delivery_zones", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 10 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type InsertDeliveryZone = typeof deliveryZones.$inferInsert;

/**
 * Time slots (créneaux horaires disponibles)
 */
export const timeSlots = mysqlTable("time_slots", {
  id: int("id").autoincrement().primaryKey(),
  slotType: mysqlEnum("slotType", ["pickup", "delivery"]).notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0=Sunday, 6=Saturday
  startTime: varchar("startTime", { length: 5 }).notNull(), // "08:00"
  endTime: varchar("endTime", { length: 5 }).notNull(), // "10:00"
  maxOrders: int("maxOrders").default(5).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = typeof timeSlots.$inferInsert;

/**
 * Customer addresses
 */
export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 50 }).default("Domicile"),
  street: text("street").notNull(),
  complement: text("complement"),
  postalCode: varchar("postalCode", { length: 10 }).notNull(),
  city: varchar("city", { length: 100 }).notNull().default("Paris"),
  instructions: text("instructions"),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

/**
 * Orders (commandes)
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 20 }).notNull().unique(),
  userId: int("userId"),
  // Guest info (if not logged in)
  guestName: varchar("guestName", { length: 100 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 20 }),
  // Address
  addressStreet: text("addressStreet").notNull(),
  addressComplement: text("addressComplement"),
  addressPostalCode: varchar("addressPostalCode", { length: 10 }).notNull(),
  addressCity: varchar("addressCity", { length: 100 }).notNull().default("Paris"),
  addressInstructions: text("addressInstructions"),
  // Scheduling
  pickupDate: timestamp("pickupDate").notNull(),
  pickupSlot: varchar("pickupSlot", { length: 20 }).notNull(), // "08:00-10:00"
  deliveryDate: timestamp("deliveryDate").notNull(),
  deliverySlot: varchar("deliverySlot", { length: 20 }).notNull(),
  // Status
  status: mysqlEnum("status", [
    "pending",
    "pickup_scheduled",
    "picked_up",
    "cleaning",
    "delivery_scheduled",
    "delivered",
    "cancelled"
  ]).default("pending").notNull(),
  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0.00"),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  serviceFee: decimal("serviceFee", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  // Options
  isSorted: boolean("isSorted").default(false),
  temperature: mysqlEnum("temperature", ["cold", "warm", "hot"]).default("warm"),
  estimatedWeight: decimal("estimatedWeight", { precision: 5, scale: 1 }),
  notes: text("notes"),
  // Payment
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded"]).default("pending"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items (articles dans une commande)
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  serviceId: int("serviceId").notNull(),
  serviceItemId: int("serviceItemId"),
  serviceName: varchar("serviceName", { length: 100 }).notNull(),
  itemName: varchar("itemName", { length: 100 }),
  quantity: int("quantity").notNull().default(1),
  weight: decimal("weight", { precision: 5, scale: 1 }),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  isPremium: boolean("isPremium").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
