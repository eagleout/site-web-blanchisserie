import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import {
  MapPin, Sparkles, ArrowLeft, ArrowRight, Check, ShoppingCart,
  Shirt, Award, Package, Calendar, Clock, User, CreditCard,
  CheckCircle2, Minus, Plus, Info
} from "lucide-react";

// ==================== TYPES ====================
interface CartItem {
  serviceId: number;
  serviceItemId?: number;
  serviceName: string;
  itemName?: string;
  quantity: number;
  weight?: number;
  unitPrice: number;
  totalPrice: number;
  isPremium: boolean;
}

interface BookingState {
  street: string;
  complement: string;
  postalCode: string;
  city: string;
  instructions: string;
  selectedServices: number[];
  items: CartItem[];
  isSorted: boolean;
  temperature: "cold" | "warm" | "hot";
  estimatedWeight: number;
  pickupDate: string;
  pickupSlot: string;
  deliveryDate: string;
  deliverySlot: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  paymentMethod: string;
}

const initialState: BookingState = {
  street: "", complement: "", postalCode: "", city: "Paris", instructions: "",
  selectedServices: [], items: [], isSorted: false, temperature: "warm", estimatedWeight: 5,
  pickupDate: "", pickupSlot: "", deliveryDate: "", deliverySlot: "",
  firstName: "", lastName: "", phone: "", email: "",
  paymentMethod: "card",
};

const STEPS = [
  { id: 1, label: "Adresse", icon: MapPin },
  { id: 2, label: "Services", icon: Shirt },
  { id: 3, label: "Configuration", icon: Package },
  { id: 4, label: "Collecte", icon: Calendar },
  { id: 5, label: "Livraison", icon: Calendar },
  { id: 6, label: "Contact", icon: User },
  { id: 7, label: "Paiement", icon: CreditCard },
  { id: 8, label: "Confirmation", icon: CheckCircle2 },
];

const SERVICE_FEE_RATE = 0.05;

// ==================== PROGRESS BAR ====================
function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        {STEPS.filter(s => s.id <= 7).map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                isCompleted ? "bg-primary text-white" :
                isActive ? "bg-primary text-white shadow-lg shadow-primary/30" :
                "bg-muted text-muted-foreground"
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / 6) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

// ==================== DYNAMIC CART ====================
function DynamicCart({ items, estimatedWeight, deliveryFee }: {
  items: CartItem[];
  estimatedWeight: number;
  deliveryFee: number;
}) {
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.totalPrice, 0), [items]);
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const total = subtotal + serviceFee + deliveryFee;

  return (
    <Card className="border-border/50 bg-white sticky top-24 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Votre panier</h3>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun service sélectionné</p>
        ) : (
          <div className="space-y-3 mb-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-start justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.serviceName}</p>
                  {item.itemName && <p className="text-xs text-muted-foreground">{item.itemName} × {item.quantity}</p>}
                  {item.weight && <p className="text-xs text-muted-foreground">{item.weight} kg{item.isPremium ? " (Premium)" : ""}</p>}
                </div>
                <span className="font-medium text-foreground ml-2">{item.totalPrice.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border/50 pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-medium">{subtotal.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frais de service</span>
            <span className="font-medium">{serviceFee.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Livraison</span>
            <span className="font-medium">{deliveryFee === 0 ? "Gratuite" : `${deliveryFee.toFixed(2)}€`}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-border/50">
            <span>Total estimé</span>
            <span className="text-primary">{total.toFixed(2)}€</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== STEP 1: ADDRESS WITH AUTOCOMPLETE ====================
function StepAddress({ state, setState }: { state: BookingState; setState: (s: BookingState) => void }) {
  const { data: zoneCheck } = trpc.zones.check.useQuery(
    { postalCode: state.postalCode },
    { enabled: state.postalCode.length === 5 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Votre adresse
        </h2>
        <p className="text-muted-foreground">Indiquez l'adresse de collecte et de livraison.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="street">Adresse *</Label>
          <AddressAutocomplete
            value={state.street}
            onChange={(val) => setState({ ...state, street: val })}
            onAddressSelect={(addr) => {
              setState({
                ...state,
                street: addr.street,
                postalCode: addr.postalCode || state.postalCode,
                city: addr.city || state.city,
              });
            }}
            placeholder="Tapez votre adresse (ex: 10 Rue de Charenton)"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="complement">Complément d'adresse</Label>
          <Input id="complement" placeholder="Bâtiment, étage, code..." value={state.complement}
            onChange={e => setState({ ...state, complement: e.target.value })} className="mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postalCode">Code postal *</Label>
            <Input id="postalCode" placeholder="75012" value={state.postalCode} maxLength={5}
              onChange={e => setState({ ...state, postalCode: e.target.value.replace(/\D/g, "") })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={state.city} onChange={e => setState({ ...state, city: e.target.value })} className="mt-1.5" />
          </div>
        </div>

        {state.postalCode.length === 5 && zoneCheck && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              zoneCheck.isDeliverable ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {zoneCheck.isDeliverable ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Bonne nouvelle ! Nous livrons dans votre zone.
                  {zoneCheck.zone && parseFloat(zoneCheck.zone.deliveryFee || "0") === 0 ? " Livraison gratuite !" : ` Frais de livraison : ${parseFloat(zoneCheck.zone?.deliveryFee || "0").toFixed(2)}€`}
                </span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 shrink-0" />
                <span>Désolé, nous ne desservons pas encore cette zone. Nous couvrons Paris 12e (75012).</span>
              </>
            )}
          </motion.div>
        )}

        <div>
          <Label htmlFor="instructions">Instructions pour le livreur</Label>
          <Input id="instructions" placeholder="Sonnez à l'interphone, code d'entrée..." value={state.instructions}
            onChange={e => setState({ ...state, instructions: e.target.value })} className="mt-1.5" />
        </div>
      </div>
    </div>
  );
}

// ==================== STEP 2: SERVICES ====================
function StepServices({ state, setState }: { state: BookingState; setState: (s: BookingState) => void }) {
  const { data: servicesData } = trpc.services.list.useQuery();

  const serviceIcons: Record<string, React.ReactNode> = {
    "washing": <Shirt className="w-6 h-6" />,
    "ironing": <Sparkles className="w-6 h-6" />,
    "dry_cleaning": <Award className="w-6 h-6" />,
    "household": <Package className="w-6 h-6" />,
  };

  const toggleService = (id: number) => {
    const selected = state.selectedServices.includes(id)
      ? state.selectedServices.filter(s => s !== id)
      : [...state.selectedServices, id];
    setState({ ...state, selectedServices: selected });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Choisissez vos services
        </h2>
        <p className="text-muted-foreground">Sélectionnez un ou plusieurs services.</p>
      </div>

      <div className="grid gap-4">
        {(servicesData || []).map(service => {
          const isSelected = state.selectedServices.includes(service.id);
          return (
            <button key={service.id} onClick={() => toggleService(service.id)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border/50 bg-white hover:border-primary/30 hover:shadow-sm"
              }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
                }`}>
                  {serviceIcons[service.category] || <Sparkles className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <span className="text-primary font-bold">
                      {parseFloat(service.basePrice).toFixed(2)}€
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        {service.pricingType === "per_kg" ? "/kg" : "/article"}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== STEP 3: CONFIGURATION ====================
function StepConfiguration({ state, setState }: { state: BookingState; setState: (s: BookingState) => void }) {
  const { data: servicesData } = trpc.services.list.useQuery();
  const { data: allItems } = trpc.services.allItems.useQuery();

  const selectedServiceDetails = useMemo(() =>
    (servicesData || []).filter(s => state.selectedServices.includes(s.id)),
    [servicesData, state.selectedServices]
  );

  const hasKgService = selectedServiceDetails.some(s => s.pricingType === "per_kg");
  const itemServices = selectedServiceDetails.filter(s => s.pricingType === "per_item");

  const updateCartItem = useCallback((serviceId: number, serviceItemId: number, serviceName: string, itemName: string, unitPrice: number, delta: number) => {
    const existing = state.items.find(i => i.serviceItemId === serviceItemId);
    let newItems: CartItem[];
    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        newItems = state.items.filter(i => i.serviceItemId !== serviceItemId);
      } else {
        newItems = state.items.map(i =>
          i.serviceItemId === serviceItemId ? { ...i, quantity: newQty, totalPrice: newQty * unitPrice } : i
        );
      }
    } else if (delta > 0) {
      newItems = [...state.items, {
        serviceId, serviceItemId, serviceName, itemName, quantity: 1,
        unitPrice, totalPrice: unitPrice, isPremium: false,
      }];
    } else {
      newItems = state.items;
    }
    setState({ ...state, items: newItems });
  }, [state, setState]);

  const updateKgItems = useCallback((weight: number, isPremium: boolean) => {
    const kgServices = selectedServiceDetails.filter(s => s.pricingType === "per_kg");
    const nonKgItems = state.items.filter(i => !kgServices.some(s => s.id === i.serviceId));
    const kgItems: CartItem[] = kgServices.map(s => {
      const price = isPremium && s.premiumPrice ? parseFloat(s.premiumPrice) : parseFloat(s.basePrice);
      return {
        serviceId: s.id, serviceName: s.name, quantity: 1,
        weight, unitPrice: price, totalPrice: price * weight, isPremium,
      };
    });
    setState({ ...state, items: [...nonKgItems, ...kgItems], estimatedWeight: weight });
  }, [state, setState, selectedServiceDetails]);

  const [isPremium, setIsPremium] = useState(false);

  // Auto-initialize kg items when entering step 3
  useEffect(() => {
    if (hasKgService && !state.items.some(i => selectedServiceDetails.some(s => s.pricingType === "per_kg" && s.id === i.serviceId))) {
      updateKgItems(state.estimatedWeight, isPremium);
    }
  }, [hasKgService]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Configurez votre commande
        </h2>
        <p className="text-muted-foreground">Précisez les détails de chaque service sélectionné.</p>
      </div>

      {hasKgService && (
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Lavage & Pliage</h3>

            <div className="flex gap-3">
              <button onClick={() => { setIsPremium(false); updateKgItems(state.estimatedWeight, false); }}
                className={`flex-1 p-3 rounded-lg border-2 text-center text-sm transition-all ${!isPremium ? "border-primary bg-primary/5" : "border-border/50"}`}>
                <div className="font-semibold">Standard</div>
                <div className="text-muted-foreground text-xs mt-1">8,90€/kg</div>
              </button>
              <button onClick={() => { setIsPremium(true); updateKgItems(state.estimatedWeight, true); }}
                className={`flex-1 p-3 rounded-lg border-2 text-center text-sm transition-all ${isPremium ? "border-primary bg-primary/5" : "border-border/50"}`}>
                <div className="font-semibold">Premium</div>
                <div className="text-muted-foreground text-xs mt-1">12,90€/kg</div>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Poids estimé</Label>
                <span className="text-sm font-semibold text-primary">{state.estimatedWeight} kg</span>
              </div>
              <input type="range" min={3} max={30} step={0.5} value={state.estimatedWeight}
                onChange={e => updateKgItems(parseFloat(e.target.value), isPremium)}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>3 kg</span><span>30 kg</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setState({ ...state, isSorted: true })}
                className={`flex-1 p-3 rounded-lg border-2 text-center text-sm transition-all ${state.isSorted ? "border-primary bg-primary/5" : "border-border/50"}`}>
                Linge trié
              </button>
              <button onClick={() => setState({ ...state, isSorted: false })}
                className={`flex-1 p-3 rounded-lg border-2 text-center text-sm transition-all ${!state.isSorted ? "border-primary bg-primary/5" : "border-border/50"}`}>
                Linge non trié
              </button>
            </div>

            <div>
              <Label className="mb-2 block">Température de lavage</Label>
              <div className="flex gap-2">
                {(["cold", "warm", "hot"] as const).map(temp => (
                  <button key={temp} onClick={() => setState({ ...state, temperature: temp })}
                    className={`flex-1 p-2.5 rounded-lg border-2 text-center text-sm transition-all ${state.temperature === temp ? "border-primary bg-primary/5" : "border-border/50"}`}>
                    {temp === "cold" ? "Froid (30°)" : temp === "warm" ? "Tiède (40°)" : "Chaud (60°)"}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {itemServices.map(service => {
        const items = (allItems || []).filter(i => i.serviceId === service.id);
        return (
          <Card key={service.id} className="border-border/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">{service.name}</h3>
              <div className="space-y-3">
                {items.map(item => {
                  const cartItem = state.items.find(i => i.serviceItemId === item.id);
                  const qty = cartItem?.quantity || 0;
                  return (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{parseFloat(item.price).toFixed(2)}€</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateCartItem(service.id, item.id, service.name, item.name, parseFloat(item.price), -1)}
                          className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
                          disabled={qty === 0}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{qty}</span>
                        <button onClick={() => updateCartItem(service.id, item.id, service.name, item.name, parseFloat(item.price), 1)}
                          className="w-8 h-8 rounded-full border border-primary/50 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ==================== STEP 4 & 5: TIME SLOTS ====================
function StepTimeSlot({ type, state, setState }: {
  type: "pickup" | "delivery";
  state: BookingState;
  setState: (s: BookingState) => void;
}) {
  const { data: slots } = type === "pickup" ? trpc.slots.pickup.useQuery() : trpc.slots.delivery.useQuery();

  const dateField = type === "pickup" ? "pickupDate" : "deliveryDate";
  const slotField = type === "pickup" ? "pickupSlot" : "deliverySlot";

  const dates = useMemo(() => {
    const result: { date: string; label: string; dayOfWeek: number }[] = [];
    const today = new Date();
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const monthNames = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
    for (let i = type === "pickup" ? 0 : 1; i < (type === "pickup" ? 7 : 8); i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        date: d.toISOString().split("T")[0],
        label: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
        dayOfWeek: d.getDay(),
      });
    }
    return result;
  }, [type]);

  const selectedDate = state[dateField];
  const selectedDayOfWeek = dates.find(d => d.date === selectedDate)?.dayOfWeek;
  const availableSlots = useMemo(() =>
    (slots || []).filter(s => s.dayOfWeek === selectedDayOfWeek),
    [slots, selectedDayOfWeek]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {type === "pickup" ? "Créneau de collecte" : "Créneau de livraison"}
        </h2>
        <p className="text-muted-foreground">
          {type === "pickup" ? "Quand souhaitez-vous que nous venions chercher votre linge ?" : "Quand souhaitez-vous être livré ?"}
        </p>
        {type === "pickup" && (
          <p className="text-xs text-primary mt-1 font-medium">Collecte possible sous 30 minutes</p>
        )}
        {type === "delivery" && (
          <p className="text-xs text-primary mt-1 font-medium">Livraison gratuite sous 24h</p>
        )}
      </div>

      <div>
        <Label className="mb-3 block font-medium">Choisissez un jour</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {dates.filter(d => d.dayOfWeek !== 0).map(d => (
            <button key={d.date} onClick={() => setState({ ...state, [dateField]: d.date, [slotField]: "" })}
              className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${
                selectedDate === d.date ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/30"
              }`}>
              <div className="font-medium text-foreground">{d.label.split(" ")[0]}</div>
              <div className="text-lg font-bold text-foreground">{d.label.split(" ")[1]}</div>
              <div className="text-xs text-muted-foreground">{d.label.split(" ")[2]}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Label className="mb-3 block font-medium">Choisissez un créneau</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableSlots.map(slot => {
              const slotStr = `${slot.startTime}-${slot.endTime}`;
              const isSelected = state[slotField] === slotStr;
              return (
                <button key={slot.id} onClick={() => setState({ ...state, [slotField]: slotStr })}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/30"
                  }`}>
                  <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <span className="text-sm font-medium">{slot.startTime} - {slot.endTime}</span>
                </button>
              );
            })}
          </div>
          {availableSlots.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun créneau disponible ce jour.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ==================== STEP 6: CONTACT ====================
function StepContact({ state, setState }: { state: BookingState; setState: (s: BookingState) => void }) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Vos informations
        </h2>
        <p className="text-muted-foreground">Nous avons besoin de vos coordonnées pour la collecte et la livraison.</p>
      </div>

      {user && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 text-sm text-primary border border-primary/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>Connecté en tant que {user.name || user.email}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input id="firstName" placeholder="Jean" value={state.firstName}
              onChange={e => setState({ ...state, firstName: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input id="lastName" placeholder="Dupont" value={state.lastName}
              onChange={e => setState({ ...state, lastName: e.target.value })} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <Input id="phone" type="tel" placeholder="06 12 34 56 78" value={state.phone}
            onChange={e => setState({ ...state, phone: e.target.value })} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="jean@example.com" value={state.email}
            onChange={e => setState({ ...state, email: e.target.value })} className="mt-1.5" />
        </div>
      </div>
    </div>
  );
}

// ==================== STEP 7: PAYMENT ====================
function StepPayment({ state, setState, total }: { state: BookingState; setState: (s: BookingState) => void; total: number }) {
  const methods = [
    { id: "card", label: "Carte bancaire", desc: "Visa, Mastercard, CB" },
    { id: "apple_pay", label: "Apple Pay", desc: "Paiement rapide" },
    { id: "google_pay", label: "Google Pay", desc: "Paiement rapide" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Paiement
        </h2>
        <p className="text-muted-foreground">Choisissez votre mode de paiement sécurisé.</p>
      </div>

      <div className="space-y-3">
        {methods.map(method => (
          <button key={method.id} onClick={() => setState({ ...state, paymentMethod: method.id })}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
              state.paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
            }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              state.paymentMethod === method.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">{method.label}</p>
              <p className="text-xs text-muted-foreground">{method.desc}</p>
            </div>
            {state.paymentMethod === method.id && (
              <Check className="w-5 h-5 text-primary ml-auto" />
            )}
          </button>
        ))}
      </div>

      {state.paymentMethod === "card" && (
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label>Numéro de carte</Label>
              <Input placeholder="4242 4242 4242 4242" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date d'expiration</Label>
                <Input placeholder="MM/AA" className="mt-1.5" />
              </div>
              <div>
                <Label>CVC</Label>
                <Input placeholder="123" className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-sm text-green-700 border border-green-200">
        <CheckCircle2 className="w-4 h-4" />
        <span>Paiement sécurisé par chiffrement SSL 256 bits</span>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
        <p className="text-sm text-muted-foreground mb-1">Montant total</p>
        <p className="text-3xl font-bold text-primary">{total.toFixed(2)}€</p>
      </div>
    </div>
  );
}

// ==================== STEP 8: CONFIRMATION ====================
function StepConfirmation({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="text-center py-8 space-y-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Commande confirmée !
        </h2>
        <p className="text-muted-foreground text-lg">Merci pour votre confiance.</p>
      </div>

      <Card className="border-border/50 max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
          <p className="text-xl font-bold text-primary">{orderNumber}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Vous recevrez un email de confirmation avec les détails de votre commande.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <Button variant="outline" className="rounded-full px-6">Retour à l'accueil</Button>
        </Link>
        <Link href="/account">
          <Button className="rounded-full px-6">Voir mes commandes</Button>
        </Link>
      </div>
    </div>
  );
}

// ==================== MAIN BOOKING PAGE ====================
export default function Booking() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(initialState);
  const [orderNumber, setOrderNumber] = useState("");
  const { user } = useAuth();

  const { data: zoneCheck } = trpc.zones.check.useQuery(
    { postalCode: state.postalCode },
    { enabled: state.postalCode.length === 5 }
  );

  const deliveryFee = useMemo(() => {
    if (zoneCheck?.zone) return parseFloat(zoneCheck.zone.deliveryFee || "0");
    return 0;
  }, [zoneCheck]);

  const subtotal = useMemo(() => state.items.reduce((sum, item) => sum + item.totalPrice, 0), [state.items]);
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const total = subtotal + serviceFee + deliveryFee;

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      setStep(8);
    },
  });

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return state.street.length > 0 && state.postalCode.length === 5 && zoneCheck?.isDeliverable;
      case 2: return state.selectedServices.length > 0;
      case 3: return state.items.length > 0;
      case 4: return state.pickupDate && state.pickupSlot;
      case 5: return state.deliveryDate && state.deliverySlot;
      case 6: return state.firstName && state.lastName && state.phone && state.email;
      case 7: return state.paymentMethod;
      default: return true;
    }
  }, [step, state, zoneCheck]);

  const handleNext = () => {
    if (step === 7) {
      createOrder.mutate({
        userId: user?.id,
        guestName: !user ? `${state.firstName} ${state.lastName}` : undefined,
        guestEmail: !user ? state.email : undefined,
        guestPhone: !user ? state.phone : undefined,
        addressStreet: state.street,
        addressComplement: state.complement || undefined,
        addressPostalCode: state.postalCode,
        addressCity: state.city,
        addressInstructions: state.instructions || undefined,
        pickupDate: new Date(state.pickupDate).toISOString(),
        pickupSlot: state.pickupSlot,
        deliveryDate: new Date(state.deliveryDate).toISOString(),
        deliverySlot: state.deliverySlot,
        isSorted: state.isSorted,
        temperature: state.temperature,
        estimatedWeight: state.estimatedWeight,
        subtotal, deliveryFee, serviceFee, total,
        paymentMethod: state.paymentMethod,
        items: state.items,
      });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {step < 8 && (
            <span className="text-sm text-muted-foreground">Étape {step} sur 7</span>
          )}
        </div>
      </header>

      <div className="pt-24 pb-12 container">
        {step < 8 && <ProgressBar currentStep={step} />}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className={step === 8 ? "lg:col-span-3" : "lg:col-span-2"}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {step === 1 && <StepAddress state={state} setState={setState} />}
                {step === 2 && <StepServices state={state} setState={setState} />}
                {step === 3 && <StepConfiguration state={state} setState={setState} />}
                {step === 4 && <StepTimeSlot type="pickup" state={state} setState={setState} />}
                {step === 5 && <StepTimeSlot type="delivery" state={state} setState={setState} />}
                {step === 6 && <StepContact state={state} setState={setState} />}
                {step === 7 && <StepPayment state={state} setState={setState} total={total} />}
                {step === 8 && <StepConfirmation orderNumber={orderNumber} />}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            {step < 8 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={handleNext} disabled={!canProceed || createOrder.isPending} className="rounded-full px-8">
                  {createOrder.isPending ? "Traitement..." : step === 7 ? "Confirmer et payer" : "Continuer"}
                  {step < 7 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}
          </div>

          {/* Cart sidebar - desktop */}
          {step < 8 && (
            <div className="hidden lg:block">
              <DynamicCart items={state.items} estimatedWeight={state.estimatedWeight} deliveryFee={deliveryFee} />
            </div>
          )}
        </div>

        {/* Mobile cart summary - visible from step 1 */}
        {step >= 1 && step < 8 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border/50 shadow-lg p-4 z-40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total estimé</p>
                <p className="text-lg font-bold text-primary">{total.toFixed(2)}€</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {state.items.length > 0 ? `${state.items.length} service(s)` : "Aucun service"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
