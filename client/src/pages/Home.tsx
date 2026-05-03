import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Shirt, Sparkles, Clock, Shield, CreditCard, Star, MapPin, Phone, Mail,
  ChevronRight, CheckCircle2, ArrowRight, Zap, Heart, Award, Timer,
  CalendarDays, Truck, Package, Users, Building2, ChevronDown, ChevronUp,
  Menu, X, Leaf, ThumbsUp, BadgeCheck
} from "lucide-react";
import { useState, useMemo } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
} as const;

// ==================== HEADER ====================
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Services", href: "#services" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Zone desservie", href: "#zone" },
    { label: "Avis", href: "#avis" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container flex items-center justify-between h-16 lg:h-18">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              OMA <span className="text-primary">SERVICES</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Pressing Premium</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map(item => (
            <a key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/booking">
            <Button size="default" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
              Réserver une collecte
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden bg-white border-t border-border/50 shadow-lg">
          <div className="container py-4 flex flex-col gap-3">
            {navItems.map(item => (
              <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-primary py-2 font-medium">
                {item.label}
              </a>
            ))}
            <Link href="/booking" onClick={() => setMobileOpen(false)}>
              <Button className="w-full rounded-full mt-2">Réserver une collecte</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

// ==================== HERO SECTION ====================
function HeroSection() {
  const badges = [
    { icon: <Zap className="w-4 h-4" />, text: "Collecte en 30 min" },
    { icon: <Truck className="w-4 h-4" />, text: "Livraison gratuite 24h" },
    { icon: <Shield className="w-4 h-4" />, text: "Paiement sécurisé" },
    { icon: <Star className="w-4 h-4" />, text: "4.9/5 satisfaction" },
    { icon: <Leaf className="w-4 h-4" />, text: "Produits éco-responsables" },
  ];

  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/30" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/40 rounded-full blur-3xl" />
      
      <div className="container relative">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Pressing premium &mdash; 66 boulevard Soult, Paris 12
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Votre linge impeccable,{" "}
            <span className="text-primary">livré chez vous</span>{" "}
            en 24h
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            OMA SERVICES collecte, nettoie et livre votre linge à domicile dans le 12<sup>e</sup> arrondissement. 
            Profitez d'un pressing professionnel sans vous déplacer.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link href="/booking">
              <Button size="lg" className="rounded-full px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all">
                Réserver ma collecte gratuite
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#tarifs">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-base bg-white/80 hover:bg-white">
                Voir les tarifs
              </Button>
            </a>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
            {badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-muted-foreground border border-border/50 shadow-sm">
                <span className="text-primary">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== SOCIAL PROOF BANNER ====================
function SocialProofBanner() {
  return (
    <section className="py-6 bg-white border-y border-border/30">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
          <div>
            <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>+1 200</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Clients satisfaits</div>
          </div>
          <div className="w-px h-10 bg-border/50 hidden md:block" />
          <div>
            <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>4.9/5</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Note moyenne</div>
          </div>
          <div className="w-px h-10 bg-border/50 hidden md:block" />
          <div>
            <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>30 min</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Délai de collecte</div>
          </div>
          <div className="w-px h-10 bg-border/50 hidden md:block" />
          <div>
            <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>24h</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">Livraison gratuite</div>
          </div>
          <div className="w-px h-10 bg-border/50 hidden md:block" />
          <div>
            <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>5 ans</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">D'expérience</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== COMMENT CA MARCHE ====================
function HowItWorks() {
  const steps = [
    { icon: <CalendarDays className="w-8 h-8" />, title: "1. Réservez en ligne", desc: "Choisissez un créneau qui vous convient. Notre livreur vient chez vous en 30 minutes, du lundi au samedi." },
    { icon: <Package className="w-8 h-8" />, title: "2. On s'occupe de tout", desc: "Lavage, repassage ou nettoyage à sec par nos experts. Produits premium et écologiques, traitement minutieux." },
    { icon: <Truck className="w-8 h-8" />, title: "3. Livraison gratuite", desc: "Votre linge propre, plié et emballé avec soin, livré gratuitement à votre porte sous 24 heures." },
  ];

  return (
    <section id="comment-ca-marche" className="py-20 lg:py-28 bg-white">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4 mx-auto">
            Simple et rapide
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Comment ça marche ?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
            Un linge impeccable en 3 étapes simples, sans quitter votre domicile.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center group">
              <div className="relative mx-auto mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mt-12">
          <Link href="/booking">
            <Button size="lg" className="rounded-full px-8 shadow-md">
              Réserver ma première collecte
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== SERVICES ====================
const serviceImages: Record<string, string> = {
  "lavage-pliage": "https://d2xsxph8kpxj0f.cloudfront.net/310519663438456958/Wo5Tn9YpbXpWunzLTm9pDV/service-lavage-pliage_362c40a9.jpg",
  "repassage": "https://d2xsxph8kpxj0f.cloudfront.net/310519663438456958/Wo5Tn9YpbXpWunzLTm9pDV/service-repassage_db930e63.jpg",
  "nettoyage-sec": "https://d2xsxph8kpxj0f.cloudfront.net/310519663438456958/Wo5Tn9YpbXpWunzLTm9pDV/service-nettoyage-sec_b8fca4e1.jpg",
  "linge-maison": "https://d2xsxph8kpxj0f.cloudfront.net/310519663438456958/Wo5Tn9YpbXpWunzLTm9pDV/service-linge-maison_092514d8.jpg",
};

function ServicesSection() {
  const { data: servicesData } = trpc.services.list.useQuery();

  const serviceExamples: Record<string, string> = {
    "lavage-pliage": "T-shirts, jeans, sous-vêtements, serviettes...",
    "repassage": "Chemises, pantalons, robes, jupes...",
    "nettoyage-sec": "Costumes, manteaux, robes de soirée...",
    "linge-maison": "Couettes, draps, rideaux, nappes...",
  };

  return (
    <section id="services" className="py-20 lg:py-28 bg-gradient-to-b from-secondary/30 to-white">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4 mx-auto">
            Expertise textile
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Des services adaptés à chaque besoin
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
            Du quotidien au plus délicat, nous traitons votre linge avec le plus grand soin.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(servicesData || []).map((service) => (
            <motion.div key={service.id} variants={fadeInUp}>
              <Card className="h-full border-border/50 bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={serviceImages[service.slug] || ""}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-primary font-bold text-sm">
                      {parseFloat(service.basePrice).toFixed(2)}€
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">
                        /{service.pricingType === "per_kg" ? "kg" : "article"}
                      </span>
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{service.description}</p>
                  <p className="text-xs text-muted-foreground italic">
                    {serviceExamples[service.slug] || ""}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==================== PRICING ====================
function PricingSection() {
  const { data: servicesData } = trpc.services.list.useQuery();
  const { data: allItems } = trpc.services.allItems.useQuery();

  const pricingGroups = useMemo(() => {
    if (!servicesData || !allItems) return [];
    return servicesData
      .filter(s => s.pricingType === "per_item")
      .map(s => ({
        serviceName: s.name,
        items: allItems.filter(i => i.serviceId === s.id && i.isActive),
      }))
      .filter(g => g.items.length > 0);
  }, [servicesData, allItems]);

  return (
    <section id="tarifs" className="py-20 lg:py-28 bg-white">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4 mx-auto">
            Transparence totale
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Des tarifs clairs, sans surprise
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
            Livraison gratuite incluse. Pas de frais cachés. Vous payez uniquement ce que vous commandez.
          </motion.p>
        </motion.div>

        {/* Lavage au kilo highlight */}
        {servicesData && (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0 shadow-xl overflow-hidden">
              <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-medium mb-3">
                    <ThumbsUp className="w-3 h-3" /> Le plus populaire
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Lavage & Pliage</h3>
                  <p className="text-white/80 text-lg">Votre linge lavé, séché et plié avec soin. Minimum 3 kg.</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold">8,90€</div>
                  <div className="text-white/70 text-sm mt-1">par kilogramme</div>
                  <div className="text-white/60 text-xs mt-2">Option Premium : 12,90€/kg</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingGroups.map((group, gi) => (
            <motion.div key={gi} variants={fadeInUp}>
              <Card className="h-full border-border/50 bg-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground pb-3 border-b border-border/50">{group.serviceName}</h3>
                  <div className="space-y-3">
                    {group.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                        <span className="text-sm font-semibold text-foreground">{parseFloat(item.price).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mt-12">
          <Link href="/booking">
            <Button size="lg" className="rounded-full px-8 shadow-md">
              Commander maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== GARANTIES ====================
function GuaranteesSection() {
  const guarantees = [
    { icon: <BadgeCheck className="w-6 h-6" />, title: "Satisfaction garantie", desc: "Si le résultat ne vous convient pas, nous retraitons votre linge gratuitement." },
    { icon: <Shield className="w-6 h-6" />, title: "Linge assuré", desc: "Vos vêtements sont couverts en cas de dommage pendant le traitement." },
    { icon: <Leaf className="w-6 h-6" />, title: "Produits éco-responsables", desc: "Nous utilisons des lessives et produits respectueux de l'environnement." },
    { icon: <Award className="w-6 h-6" />, title: "Expertise professionnelle", desc: "5 ans d'expérience et une équipe formée aux textiles les plus exigeants." },
    { icon: <Timer className="w-6 h-6" />, title: "Ponctualité garantie", desc: "Respect strict des créneaux de collecte et de livraison choisis." },
    { icon: <CheckCircle2 className="w-6 h-6" />, title: "Contrôle qualité", desc: "Chaque article est inspecté individuellement avant d'être emballé." },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-secondary/30">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4 mx-auto">
            Votre confiance, notre priorité
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nos engagements qualité
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
            Chez OMA SERVICES, chaque détail compte. Nous nous engageons sur la qualité, la ponctualité et votre satisfaction.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guarantees.map((item, i) => (
            <motion.div key={i} variants={fadeInUp} className="flex gap-4 p-6 rounded-2xl bg-white border border-border/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==================== PROFESSIONNELS ====================
function ProfessionalsSection() {
  const clients = [
    { icon: <Building2 className="w-5 h-5" />, name: "Airbnb & Conciergeries" },
    { icon: <Building2 className="w-5 h-5" />, name: "Hôtels & Résidences" },
    { icon: <Building2 className="w-5 h-5" />, name: "Restaurants & Traiteurs" },
    { icon: <Building2 className="w-5 h-5" />, name: "Cabinets médicaux" },
    { icon: <Building2 className="w-5 h-5" />, name: "Salles de sport" },
    { icon: <Building2 className="w-5 h-5" />, name: "Instituts & Spas" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-primary text-white">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
              <Users className="w-4 h-4" />
              Offre B2B
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Solutions sur mesure pour les professionnels
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/80 text-lg mb-4 leading-relaxed">
              Rotation rapide, service fiable, facturation mensuelle et adaptation aux volumes. 
              OMA SERVICES accompagne les professionnels du 12<sup>e</sup> arrondissement et alentours.
            </motion.p>
            <motion.ul variants={fadeInUp} className="space-y-2 mb-8 text-white/80">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/90" /> Tarifs dégressifs selon le volume</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/90" /> Facturation mensuelle simplifiée</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/90" /> Collecte et livraison quotidiennes possibles</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/90" /> Interlocuteur dédié</li>
            </motion.ul>
            <motion.div variants={fadeInUp}>
              <a href="mailto:contact@oma-services.fr?subject=Demande de devis professionnel">
                <Button size="lg" variant="secondary" className="rounded-full px-8 text-primary font-semibold">
                  Demander un devis professionnel
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 gap-4">
            {clients.map((client, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  {client.icon}
                </div>
                <span className="text-sm font-medium">{client.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ==================== ZONE DESSERVIE ====================
function ZoneSection() {
  const { data: zones } = trpc.zones.list.useQuery();

  return (
    <section id="zone" className="py-20 lg:py-28 bg-white">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4 mx-auto">
            <MapPin className="w-4 h-4" /> Proximité
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nous intervenons près de chez vous
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
            Basés au 66 boulevard Soult (Paris 12), nous couvrons le 12<sup>e</sup> et les arrondissements limitrophes.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(zones || []).map(zone => (
              <div key={zone.id} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-secondary/20 hover:shadow-sm transition-all">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">{zone.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(zone.deliveryFee || "0") === 0 ? "Livraison gratuite" : `+${parseFloat(zone.deliveryFee || "0").toFixed(2)}€`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== AVIS CLIENTS ====================
function ReviewsSection() {
  const reviews = [
    { name: "Marie L.", location: "Rue de Charenton", rating: 5, text: "Service impeccable ! Mon linge est revenu parfaitement plié et il sentait divinement bon. OMA SERVICES est devenu mon pressing attitré.", date: "Il y a 2 jours" },
    { name: "Thomas D.", location: "Avenue Daumesnil", rating: 5, text: "Très pratique quand on manque de temps. La collecte était ponctuelle et la livraison le lendemain comme promis. Bravo !", date: "Il y a 1 semaine" },
    { name: "Sophie M.", location: "Boulevard Soult", rating: 5, text: "Excellent rapport qualité-prix. Mes chemises sont parfaitement repassées, mieux qu'en pressing classique. Cliente régulière.", date: "Il y a 2 semaines" },
    { name: "Pierre R.", location: "Place Félix Éboué", rating: 5, text: "Mes costumes sont traités avec un soin remarquable. Le nettoyage à sec est de qualité professionnelle. Je recommande.", date: "Il y a 3 semaines" },
    { name: "Camille B.", location: "Rue de Reuilly", rating: 5, text: "J'utilise le service pour mes couettes et draps. C'est un vrai gain de temps et la qualité est toujours au rendez-vous.", date: "Il y a 1 mois" },
    { name: "Antoine G.", location: "Rue du Faubourg Saint-Antoine", rating: 5, text: "En tant que propriétaire Airbnb, OMA SERVICES est devenu indispensable. Rotation rapide et linge toujours impeccable pour mes voyageurs.", date: "Il y a 1 mois" },
  ];

  return (
    <section id="avis" className="py-20 lg:py-28 bg-gradient-to-b from-secondary/30 to-white">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ils nous font confiance
          </motion.h2>
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            <span className="text-lg font-semibold ml-2">4.9/5</span>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-muted-foreground">Basé sur plus de 200 avis vérifiés</motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card className="h-full border-border/50 bg-white hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{review.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{review.location}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==================== FAQ ====================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: "Quels sont les délais de traitement ?", a: "Notre livreur peut venir chercher votre linge en 30 minutes. Le traitement standard prend 24 heures. Votre linge propre et plié est livré gratuitement le lendemain de la collecte." },
    { q: "Comment fonctionne la collecte ?", a: "Réservez un créneau en ligne, notre livreur vient chercher votre linge à votre porte. Placez-le dans un sac (nous pouvons vous en fournir) et nous nous occupons du reste. C'est aussi simple que ça." },
    { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons les cartes bancaires (Visa, Mastercard, CB), Apple Pay et Google Pay. Le paiement est 100% sécurisé et effectué en ligne lors de la réservation." },
    { q: "Quelle est votre zone de livraison ?", a: "Nous couvrons principalement Paris 12e et les arrondissements limitrophes (4e, 5e, 11e, 13e, 20e) ainsi que Charenton-le-Pont, Saint-Mandé et Vincennes. Notre local est situé au 66 boulevard Soult, 75012 Paris." },
    { q: "Puis-je laver une couette ou des vêtements délicats ?", a: "Absolument ! Notre service de nettoyage à sec est spécialement conçu pour les textiles délicats : soie, cachemire, laine, cuir et daim. Pour les couettes et draps, notre service de lavage les prend en charge." },
    { q: "Proposez-vous des offres pour les professionnels ?", a: "Oui ! OMA SERVICES propose des tarifs dégressifs et des services adaptés aux professionnels : Airbnb, hôtels, restaurants, salles de sport. Contactez-nous à contact@oma-services.fr pour un devis personnalisé." },
    { q: "Que se passe-t-il si je ne suis pas satisfait ?", a: "Votre satisfaction est notre priorité. Si le résultat ne vous convient pas, nous retraitons votre linge gratuitement. Contactez-nous dans les 24h suivant la livraison." },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white">
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Questions fréquentes
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">
            Tout ce que vous devez savoir avant de réserver.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeInUp} className="border border-border/50 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/20 transition-colors"
              >
                <span className="font-medium text-foreground pr-4">{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
              </button>
              {openIndex === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5">
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==================== CTA FINAL ====================
function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-r from-primary to-primary/80 text-white">
      <div className="container text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Prêt à gagner du temps ?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-white/80 text-lg mb-4 max-w-xl mx-auto">
            Réservez votre première collecte en 2 minutes. Livraison gratuite sous 24h.
          </motion.p>
          <motion.p variants={fadeInUp} className="text-white/60 text-sm mb-8">
            Pas d'engagement. Annulation gratuite. Satisfaction garantie.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/booking">
              <Button size="lg" variant="secondary" className="rounded-full px-10 py-6 text-base text-primary font-semibold shadow-xl hover:shadow-2xl transition-all">
                Réserver ma collecte gratuite
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer className="bg-foreground text-white/70 py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  OMA <span className="text-primary">SERVICES</span>
                </span>
                <span className="text-[9px] text-white/50 font-medium tracking-wider uppercase">Pressing Premium</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Votre pressing premium avec collecte et livraison à domicile dans le 12<sup>e</sup> arrondissement de Paris et alentours.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>66 boulevard Soult<br />75012 Paris</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                01 23 45 67 89
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                contact@oma-services.fr
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Lun-Sam : 8h-20h
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-white transition-colors">Lavage & Pliage</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Repassage professionnel</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Nettoyage à sec</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Linge de maison</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Service professionnel B2B</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a></li>
              <li><a href="#tarifs" className="hover:text-white transition-colors">Nos tarifs</a></li>
              <li><a href="#zone" className="hover:text-white transition-colors">Zone desservie</a></li>
              <li><a href="#avis" className="hover:text-white transition-colors">Avis clients</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Réserver</h4>
            <p className="text-sm mb-4 leading-relaxed">
              Réservez votre collecte en 2 minutes. Livraison gratuite en 24h.
            </p>
            <Link href="/booking">
              <Button className="rounded-full w-full">
                Réserver une collecte
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">&copy; 2026 OMA SERVICES. Tous droits réservés. SIRET : XXX XXX XXX XXXXX</p>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">CGV</a>
            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN PAGE ====================
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <HeroSection />
        <SocialProofBanner />
        <HowItWorks />
        <ServicesSection />
        <PricingSection />
        <GuaranteesSection />
        <ProfessionalsSection />
        <ZoneSection />
        <ReviewsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
