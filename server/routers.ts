import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== SERVICES ====================
  services: router({
    list: publicProcedure.query(async () => {
      return db.getActiveServices();
    }),
    getItems: publicProcedure.input(z.object({ serviceId: z.number() })).query(async ({ input }) => {
      return db.getServiceItemsByServiceId(input.serviceId);
    }),
    allItems: publicProcedure.query(async () => {
      return db.getAllServiceItems();
    }),
  }),

  // ==================== DELIVERY ZONES ====================
  zones: router({
    list: publicProcedure.query(async () => {
      return db.getActiveDeliveryZones();
    }),
    check: publicProcedure.input(z.object({ postalCode: z.string() })).query(async ({ input }) => {
      const zone = await db.getDeliveryZoneByPostalCode(input.postalCode);
      return { isDeliverable: !!zone, zone: zone || null };
    }),
  }),

  // ==================== TIME SLOTS ====================
  slots: router({
    pickup: publicProcedure.query(async () => {
      return db.getActiveTimeSlots("pickup");
    }),
    delivery: publicProcedure.query(async () => {
      return db.getActiveTimeSlots("delivery");
    }),
  }),

  // ==================== ORDERS ====================
  orders: router({
    create: publicProcedure.input(z.object({
      userId: z.number().optional(),
      guestName: z.string().optional(),
      guestEmail: z.string().email().optional(),
      guestPhone: z.string().optional(),
      addressStreet: z.string().min(1),
      addressComplement: z.string().optional(),
      addressPostalCode: z.string().min(1),
      addressCity: z.string().default("Paris"),
      addressInstructions: z.string().optional(),
      pickupDate: z.string(),
      pickupSlot: z.string(),
      deliveryDate: z.string(),
      deliverySlot: z.string(),
      isSorted: z.boolean().default(false),
      temperature: z.enum(["cold", "warm", "hot"]).default("warm"),
      estimatedWeight: z.number().optional(),
      notes: z.string().optional(),
      subtotal: z.number(),
      deliveryFee: z.number().default(0),
      serviceFee: z.number().default(0),
      total: z.number(),
      paymentMethod: z.string().optional(),
      items: z.array(z.object({
        serviceId: z.number(),
        serviceItemId: z.number().optional(),
        serviceName: z.string(),
        itemName: z.string().optional(),
        quantity: z.number().default(1),
        weight: z.number().optional(),
        unitPrice: z.number(),
        totalPrice: z.number(),
        isPremium: z.boolean().default(false),
      })),
    })).mutation(async ({ input, ctx }) => {
      const { items, ...orderData } = input;
      const userId = ctx.user?.id || input.userId;
      
      const result = await db.createOrder(
        {
          ...orderData,
          userId: userId || null,
          pickupDate: new Date(input.pickupDate),
          deliveryDate: new Date(input.deliveryDate),
          subtotal: input.subtotal.toFixed(2),
          deliveryFee: input.deliveryFee.toFixed(2),
          serviceFee: input.serviceFee.toFixed(2),
          total: input.total.toFixed(2),
          estimatedWeight: input.estimatedWeight?.toString() || null,
          paymentStatus: "paid",
          status: "pending",
        },
        items.map(item => ({
          serviceId: item.serviceId,
          serviceItemId: item.serviceItemId || null,
          serviceName: item.serviceName,
          itemName: item.itemName || null,
          quantity: item.quantity,
          weight: item.weight?.toString() || null,
          unitPrice: item.unitPrice.toFixed(2),
          totalPrice: item.totalPrice.toFixed(2),
          isPremium: item.isPremium,
        }))
      );

      // Send order confirmation notification to owner
      const pickupDateFormatted = new Date(input.pickupDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      const deliveryDateFormatted = new Date(input.deliveryDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      const customerName = ctx.user?.name || input.guestName || "Client";
      const customerEmail = ctx.user?.email || input.guestEmail || "Non renseigné";
      const customerPhone = input.guestPhone || "Non renseigné";
      
      const itemsList = items.map(item => {
        const name = item.itemName ? `${item.serviceName} - ${item.itemName}` : item.serviceName;
        const qty = item.weight ? `${item.weight} kg` : `x${item.quantity}`;
        return `  \u2022 ${name} (${qty}) : ${item.totalPrice.toFixed(2)}\u20ac`;
      }).join("\n");

      const notifContent = [
        `Nouvelle commande re\u00e7ue : ${result.orderNumber}`,
        ``,
        `Client : ${customerName}`,
        `Email : ${customerEmail}`,
        `T\u00e9l\u00e9phone : ${customerPhone}`,
        `Adresse : ${input.addressStreet}, ${input.addressPostalCode} ${input.addressCity}`,
        ``,
        `Services command\u00e9s :`,
        itemsList,
        ``,
        `Collecte : ${pickupDateFormatted} (${input.pickupSlot})`,
        `Livraison : ${deliveryDateFormatted} (${input.deliverySlot})`,
        ``,
        `Sous-total : ${input.subtotal.toFixed(2)}\u20ac`,
        input.deliveryFee > 0 ? `Frais de livraison : ${input.deliveryFee.toFixed(2)}\u20ac` : `Livraison : Gratuite`,
        `Total : ${input.total.toFixed(2)}\u20ac`,
        `Paiement : Confirm\u00e9`,
      ].join("\n");

      // Fire and forget - don't block the order creation
      notifyOwner({
        title: `Nouvelle commande ${result.orderNumber} - ${input.total.toFixed(2)}\u20ac`,
        content: notifContent,
      }).catch(err => console.warn("[Order] Failed to send notification:", err));
      
      return result;
    }),
    
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),
    
    getByNumber: publicProcedure.input(z.object({ orderNumber: z.string() })).query(async ({ input }) => {
      const order = await db.getOrderByNumber(input.orderNumber);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      const items = await db.getOrderItems(order.id);
      return { ...order, items };
    }),
  }),

  // ==================== ADDRESSES ====================
  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAddresses(ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({
      label: z.string().default("Domicile"),
      street: z.string().min(1),
      complement: z.string().optional(),
      postalCode: z.string().min(1),
      city: z.string().default("Paris"),
      instructions: z.string().optional(),
      isDefault: z.boolean().default(false),
    })).mutation(async ({ input, ctx }) => {
      await db.createAddress({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await db.deleteAddress(input.id, ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== ADMIN ====================
  admin: router({
    stats: adminProcedure.query(async () => {
      return db.getOrderStats();
    }),
    orders: adminProcedure.input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional()).query(async ({ input }) => {
      return db.getAllOrders(input?.limit || 50, input?.offset || 0);
    }),
    orderDetails: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      const items = await db.getOrderItems(order.id);
      return { ...order, items };
    }),
    updateOrderStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["pending", "pickup_scheduled", "picked_up", "cleaning", "delivery_scheduled", "delivered", "cancelled"]),
    })).mutation(async ({ input }) => {
      await db.updateOrderStatus(input.id, input.status);
      
      // Notify owner of status change
      const statusLabels: Record<string, string> = {
        pending: "En attente",
        pickup_scheduled: "Collecte planifi\u00e9e",
        picked_up: "Collect\u00e9",
        cleaning: "En nettoyage",
        delivery_scheduled: "Livraison planifi\u00e9e",
        delivered: "Livr\u00e9",
        cancelled: "Annul\u00e9",
      };
      const order = await db.getOrderById(input.id);
      if (order) {
        notifyOwner({
          title: `Commande ${order.orderNumber} - Statut : ${statusLabels[input.status] || input.status}`,
          content: `La commande ${order.orderNumber} a \u00e9t\u00e9 mise \u00e0 jour.\n\nNouveau statut : ${statusLabels[input.status] || input.status}\nClient : ${order.guestName || "Utilisateur enregistr\u00e9"}\nTotal : ${order.total}\u20ac`,
        }).catch(err => console.warn("[Admin] Failed to send status notification:", err));
      }
      
      return { success: true };
    }),
    services: adminProcedure.query(async () => {
      return db.getAllServices();
    }),
    serviceItems: adminProcedure.query(async () => {
      return db.getAllServiceItems();
    }),
    updateService: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      basePrice: z.string().optional(),
      premiumPrice: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateService(id, data as any);
      return { success: true };
    }),
    updateServiceItem: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      price: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateServiceItem(id, data as any);
      return { success: true };
    }),
    zones: adminProcedure.query(async () => {
      return db.getAllDeliveryZones();
    }),
    timeSlots: adminProcedure.query(async () => {
      return db.getAllTimeSlots();
    }),
    updateTimeSlot: adminProcedure.input(z.object({
      id: z.number(),
      isActive: z.boolean().optional(),
      maxOrders: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateTimeSlot(id, data);
      return { success: true };
    }),
    users: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
