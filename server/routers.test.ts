import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ==================== HELPERS ====================
type CookieCall = { name: string; options: Record<string, unknown> };
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
  return { ctx };
}

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

// ==================== TESTS ====================

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("services.list", () => {
  it("returns a list of active services", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.list();
    expect(Array.isArray(result)).toBe(true);
    // Should have seeded services
    expect(result.length).toBeGreaterThan(0);
    // Each service should have required fields
    result.forEach(service => {
      expect(service).toHaveProperty("id");
      expect(service).toHaveProperty("name");
      expect(service).toHaveProperty("basePrice");
      expect(service).toHaveProperty("category");
    });
  });
});

describe("services.allItems", () => {
  it("returns all service items", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.allItems();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(item => {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("price");
      expect(item).toHaveProperty("serviceId");
    });
  });
});

describe("zones.list", () => {
  it("returns active delivery zones", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.zones.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(zone => {
      expect(zone).toHaveProperty("name");
      expect(zone).toHaveProperty("postalCode");
    });
  });
});

describe("zones.check", () => {
  it("returns deliverable for Paris 12 postal code", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.zones.check({ postalCode: "75012" });
    expect(result.isDeliverable).toBe(true);
    expect(result.zone).toBeDefined();
    expect(result.zone?.postalCode).toBe("75012");
  });

  it("returns non-deliverable for unknown postal code", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.zones.check({ postalCode: "99999" });
    expect(result.isDeliverable).toBe(false);
    expect(result.zone).toBeNull();
  });
});

describe("slots.pickup", () => {
  it("returns pickup time slots", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.slots.pickup();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(slot => {
      expect(slot).toHaveProperty("startTime");
      expect(slot).toHaveProperty("endTime");
      expect(slot).toHaveProperty("dayOfWeek");
      expect(slot.slotType).toBe("pickup");
    });
  });
});

describe("slots.delivery", () => {
  it("returns delivery time slots", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.slots.delivery();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(slot => {
      expect(slot.slotType).toBe("delivery");
    });
  });
});

describe("admin access control", () => {
  it("denies access to non-admin users", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow(/FORBIDDEN|Admin access required/);
  });

  it("allows admin users to access stats", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("pending");
    expect(result).toHaveProperty("delivered");
    expect(result).toHaveProperty("revenue");
  });

  it("denies unauthenticated access to admin", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});

describe("admin.orders", () => {
  it("returns orders list for admin", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.orders();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin.services", () => {
  it("returns all services for admin", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.services();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("admin.timeSlots", () => {
  it("returns all time slots for admin", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.timeSlots();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("orders.create", () => {
  it("creates an order and returns order number", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.orders.create({
      addressStreet: "123 Rue de Charenton",
      addressPostalCode: "75012",
      addressCity: "Paris",
      pickupDate: new Date().toISOString(),
      pickupSlot: "09:00-11:00",
      deliveryDate: new Date(Date.now() + 86400000).toISOString(),
      deliverySlot: "14:00-16:00",
      subtotal: 44.50,
      deliveryFee: 0,
      serviceFee: 2.23,
      total: 46.73,
      paymentMethod: "card",
      items: [
        {
          serviceId: 1,
          serviceName: "Lavage & Pliage Standard",
          quantity: 1,
          weight: 5,
          unitPrice: 8.90,
          totalPrice: 44.50,
          isPremium: false,
        },
      ],
    });
    expect(result).toHaveProperty("orderNumber");
    expect(result.orderNumber).toMatch(/^BLP-/);
  });
});

describe("protected routes", () => {
  it("denies unauthenticated access to myOrders", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.orders.myOrders()).rejects.toThrow();
  });

  it("allows authenticated access to myOrders", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.orders.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });

  it("denies unauthenticated access to addresses.list", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.addresses.list()).rejects.toThrow();
  });
});
