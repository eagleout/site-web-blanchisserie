import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, Shirt, MapPin, Clock, Users, LogOut,
  ArrowLeft, ChevronRight, DollarSign, TrendingUp, CheckCircle2,
  Truck, Eye, Edit2, Save, X, Sparkles
} from "lucide-react";
import { Link } from "wouter";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  pickup_scheduled: { label: "Collecte planifiée", color: "bg-blue-100 text-blue-700" },
  picked_up: { label: "Collecté", color: "bg-indigo-100 text-indigo-700" },
  cleaning: { label: "En nettoyage", color: "bg-purple-100 text-purple-700" },
  delivery_scheduled: { label: "Livraison planifiée", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Livré", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-700" },
};

const STATUS_OPTIONS = [
  "pending", "pickup_scheduled", "picked_up", "cleaning", "delivery_scheduled", "delivered", "cancelled"
] as const;

type Tab = "dashboard" | "orders" | "services" | "slots" | "clients";

// ==================== DASHBOARD TAB ====================
function DashboardTab() {
  const { data: stats } = trpc.admin.stats.useQuery();

  const cards = [
    { label: "Total commandes", value: stats?.total || 0, icon: <Package className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
    { label: "En attente", value: stats?.pending || 0, icon: <Clock className="w-5 h-5" />, color: "text-yellow-600 bg-yellow-50" },
    { label: "En cours", value: stats?.inProgress || 0, icon: <Truck className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" },
    { label: "Livrées", value: stats?.delivered || 0, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-green-600 bg-green-50" },
    { label: "Chiffre d'affaires", value: `${(stats?.revenue || 0).toFixed(2)}€`, icon: <DollarSign className="w-5 h-5" />, color: "text-primary bg-primary/10" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Tableau de bord</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== ORDERS TAB ====================
function OrdersTab() {
  const { data: orders, refetch } = trpc.admin.orders.useQuery();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: orderDetails } = trpc.admin.orderDetails.useQuery(
    { id: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );
  const utils = trpc.useUtils();
  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      refetch();
      utils.admin.orderDetails.invalidate({ id: selectedOrderId! });
      toast.success("Statut mis à jour");
    },
  });

  if (selectedOrderId && orderDetails) {
    const status = STATUS_LABELS[orderDetails.status] || { label: orderDetails.status, color: "bg-gray-100 text-gray-700" };
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelectedOrderId(null)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux commandes
        </Button>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{orderDetails.orderNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(orderDetails.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Client</h4>
                <p className="font-medium">{orderDetails.guestName || `User #${orderDetails.userId}`}</p>
                <p className="text-sm text-muted-foreground">{orderDetails.guestEmail}</p>
                <p className="text-sm text-muted-foreground">{orderDetails.guestPhone}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Adresse</h4>
                <p className="text-sm">{orderDetails.addressStreet}</p>
                {orderDetails.addressComplement && <p className="text-sm text-muted-foreground">{orderDetails.addressComplement}</p>}
                <p className="text-sm">{orderDetails.addressPostalCode} {orderDetails.addressCity}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Collecte</h4>
                <p className="text-sm">{new Date(orderDetails.pickupDate).toLocaleDateString("fr-FR")} — {orderDetails.pickupSlot}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Livraison</h4>
                <p className="text-sm">{new Date(orderDetails.deliveryDate).toLocaleDateString("fr-FR")} — {orderDetails.deliverySlot}</p>
              </div>
            </div>

            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Articles</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Service</th>
                        <th className="text-left p-3 font-medium">Article</th>
                        <th className="text-center p-3 font-medium">Qté</th>
                        <th className="text-right p-3 font-medium">Prix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.items.map((item: any) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">{item.serviceName}</td>
                          <td className="p-3 text-muted-foreground">{item.itemName || (item.weight ? `${item.weight} kg` : "—")}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right font-medium">{parseFloat(item.totalPrice).toFixed(2)}€</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-6">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-8"><span className="text-muted-foreground">Sous-total</span><span>{parseFloat(orderDetails.subtotal).toFixed(2)}€</span></div>
                <div className="flex justify-between gap-8"><span className="text-muted-foreground">Frais de service</span><span>{parseFloat(orderDetails.serviceFee).toFixed(2)}€</span></div>
                <div className="flex justify-between gap-8"><span className="text-muted-foreground">Livraison</span><span>{parseFloat(orderDetails.deliveryFee).toFixed(2)}€</span></div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{parseFloat(orderDetails.total).toFixed(2)}€</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Changer le statut</h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => {
                  const st = STATUS_LABELS[s];
                  return (
                    <Button key={s} size="sm" variant={orderDetails.status === s ? "default" : "outline"}
                      onClick={() => updateStatus.mutate({ id: orderDetails.id, status: s })}
                      disabled={updateStatus.isPending}
                      className="rounded-full text-xs">
                      {st.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Commandes</h2>
      {!orders || orders.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune commande pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">N° Commande</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Statut</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const status = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={order.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-medium">{order.orderNumber}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="p-3 text-right font-medium">{parseFloat(order.total).toFixed(2)}€</td>
                    <td className="p-3 text-center">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrderId(order.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================== SERVICES TAB ====================
function ServicesTab() {
  const { data: services, refetch: refetchServices } = trpc.admin.services.useQuery();
  const { data: items, refetch: refetchItems } = trpc.admin.serviceItems.useQuery();
  const updateService = trpc.admin.updateService.useMutation({
    onSuccess: () => { refetchServices(); toast.success("Service mis à jour"); },
  });
  const updateItem = trpc.admin.updateServiceItem.useMutation({
    onSuccess: () => { refetchItems(); toast.success("Article mis à jour"); },
  });

  const [editingService, setEditingService] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Services & Tarifs</h2>

      <div className="space-y-6">
        {(services || []).map(service => {
          const serviceItems = (items || []).filter(i => i.serviceId === service.id);
          return (
            <Card key={service.id} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${service.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {service.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingService === service.id ? (
                      <>
                        <Input value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-24 h-8 text-sm" placeholder="Prix" />
                        <Button size="sm" variant="ghost" onClick={() => {
                          updateService.mutate({ id: service.id, basePrice: editPrice });
                          setEditingService(null);
                        }}><Save className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingService(null)}><X className="w-4 h-4" /></Button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-primary">{parseFloat(service.basePrice).toFixed(2)}€</span>
                        <span className="text-xs text-muted-foreground">/{service.pricingType === "per_kg" ? "kg" : "article"}</span>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingService(service.id); setEditPrice(service.basePrice); }}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost"
                          onClick={() => updateService.mutate({ id: service.id, isActive: !service.isActive })}>
                          {service.isActive ? "Désactiver" : "Activer"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {serviceItems.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2.5 font-medium">Article</th>
                          <th className="text-right p-2.5 font-medium">Prix</th>
                          <th className="text-center p-2.5 font-medium">Statut</th>
                          <th className="text-center p-2.5 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceItems.map(item => (
                          <tr key={item.id} className="border-t">
                            <td className="p-2.5">{item.name}</td>
                            <td className="p-2.5 text-right">
                              {editingItem === item.id ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Input value={editItemPrice} onChange={e => setEditItemPrice(e.target.value)} className="w-20 h-7 text-sm" />
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                    updateItem.mutate({ id: item.id, price: editItemPrice });
                                    setEditingItem(null);
                                  }}><Save className="w-3 h-3" /></Button>
                                </div>
                              ) : (
                                <span className="font-medium">{parseFloat(item.price).toFixed(2)}€</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {item.isActive ? "Actif" : "Inactif"}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <Button size="sm" variant="ghost" className="h-7" onClick={() => { setEditingItem(item.id); setEditItemPrice(item.price); }}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ==================== TIME SLOTS TAB ====================
function SlotsTab() {
  const { data: slots, refetch } = trpc.admin.timeSlots.useQuery();
  const updateSlot = trpc.admin.updateTimeSlot.useMutation({
    onSuccess: () => { refetch(); toast.success("Créneau mis à jour"); },
  });

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const pickupSlots = (slots || []).filter(s => s.slotType === "pickup");
  const deliverySlots = (slots || []).filter(s => s.slotType === "delivery");

  const renderSlotTable = (slotList: typeof pickupSlots, title: string) => (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">{title}</h3>
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2.5 font-medium">Jour</th>
                <th className="text-left p-2.5 font-medium">Créneau</th>
                <th className="text-center p-2.5 font-medium">Max commandes</th>
                <th className="text-center p-2.5 font-medium">Actif</th>
              </tr>
            </thead>
            <tbody>
              {slotList.map(slot => (
                <tr key={slot.id} className="border-t">
                  <td className="p-2.5 font-medium">{dayNames[slot.dayOfWeek]}</td>
                  <td className="p-2.5">{slot.startTime} - {slot.endTime}</td>
                  <td className="p-2.5 text-center">{slot.maxOrders}</td>
                  <td className="p-2.5 text-center">
                    <button onClick={() => updateSlot.mutate({ id: slot.id, isActive: !slot.isActive })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        slot.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}>
                      {slot.isActive ? "Actif" : "Inactif"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Créneaux horaires</h2>
      <div className="space-y-6">
        {renderSlotTable(pickupSlots, "Créneaux de collecte")}
        {renderSlotTable(deliverySlots, "Créneaux de livraison")}
      </div>
    </div>
  );
}

// ==================== CLIENTS TAB ====================
function ClientsTab() {
  const { data: users } = trpc.admin.users.useQuery();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Clients</h2>
      {!users || users.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun client inscrit.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nom</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Rôle</th>
                <th className="text-left p-3 font-medium">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t hover:bg-muted/20">
                  <td className="p-3 font-medium">{user.name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{user.email || "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{user.role}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN ADMIN PAGE ====================
export default function Admin() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Administration</h1>
          <p className="text-muted-foreground mb-6">Connectez-vous pour accéder au panneau d'administration.</p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="rounded-full px-8">Se connecter</Button>
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Accès refusé</h1>
          <p className="text-muted-foreground mb-6">Vous n'avez pas les droits d'administration.</p>
          <Link href="/">
            <Button variant="outline" className="rounded-full px-6">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "orders", label: "Commandes", icon: <Package className="w-4 h-4" /> },
    { id: "services", label: "Services & Tarifs", icon: <Shirt className="w-4 h-4" /> },
    { id: "slots", label: "Créneaux", icon: <Clock className="w-4 h-4" /> },
    { id: "clients", label: "Clients", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border/50 flex flex-col shrink-0 hidden lg:flex">
        <div className="p-4 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Admin Panel
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === tab.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => logout()} className="shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-2 p-3 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8 overflow-auto">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "slots" && <SlotsTab />}
        {activeTab === "clients" && <ClientsTab />}
      </main>
    </div>
  );
}
