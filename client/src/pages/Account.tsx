import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Sparkles, User, Package, MapPin, LogOut, Clock, ArrowRight, ChevronRight
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  pickup_scheduled: { label: "Collecte planifiée", color: "bg-blue-100 text-blue-700" },
  picked_up: { label: "Collecté", color: "bg-indigo-100 text-indigo-700" },
  cleaning: { label: "En nettoyage", color: "bg-purple-100 text-purple-700" },
  delivery_scheduled: { label: "Livraison planifiée", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Livré", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-700" },
};

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  OMA <span className="text-primary">SERVICES</span>
                </span>
                <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">Pressing Premium</span>
              </div>
            </Link>
          </div>
        </header>
        <div className="pt-24 container text-center py-20">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Mon compte</h1>
          <p className="text-muted-foreground mb-8">Connectez-vous pour accéder à votre espace client.</p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="rounded-full px-8">Se connecter</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                OMA <span className="text-primary">SERVICES</span>
              </span>
              <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase">Pressing Premium</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/booking">
              <Button size="sm" className="rounded-full">Nouvelle commande</Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={() => logout()} className="text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-12 container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bonjour, {user?.name || "Client"}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Mes commandes
            </h2>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore de commande.</p>
                  <Link href="/booking">
                    <Button className="rounded-full">Passer ma première commande</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const status = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <Card key={order.id} className="border-border/50 hover:shadow-md transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-foreground">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {order.addressPostalCode}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {order.pickupSlot}
                            </span>
                          </div>
                          <span className="font-bold text-primary">{parseFloat(order.total).toFixed(2)}€</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Mon profil
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nom</p>
                  <p className="font-medium">{user?.name || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Membre depuis</p>
                  <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
