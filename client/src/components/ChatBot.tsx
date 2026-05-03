import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Bot, User } from "lucide-react";
import { Link } from "wouter";

// ==================== FAQ KNOWLEDGE BASE ====================
interface FAQEntry {
  keywords: string[];
  question: string;
  answer: string;
  cta?: { label: string; href: string };
}

const faqKnowledge: FAQEntry[] = [
  {
    keywords: ["tarif", "prix", "coût", "coute", "combien", "cher", "€", "euro", "kilo", "kg"],
    question: "Quels sont vos tarifs ?",
    answer: "Nos tarifs sont transparents et compétitifs :\n\n• **Lavage & Pliage** : 8,90€/kg (standard) ou 12,90€/kg (premium)\n• **Repassage** : à partir de 3,50€ par article\n• **Nettoyage à sec** : à partir de 12€ par article\n• **Linge de maison** : à partir de 8€ par article\n\nLa livraison est **gratuite** pour toutes les commandes. Vous pouvez consulter tous nos tarifs détaillés sur notre page.",
    cta: { label: "Voir tous les tarifs", href: "/#tarifs" },
  },
  {
    keywords: ["zone", "quartier", "arrondissement", "livr", "couvr", "desserv", "adresse", "secteur", "paris", "12e", "12ème", "intervenir", "intervenez"],
    question: "Intervenez-vous dans mon quartier ?",
    answer: "Nous couvrons **Paris 12e** et les arrondissements limitrophes :\n\n• Paris 4e, 5e, 11e, 13e, 20e\n• Charenton-le-Pont, Saint-Mandé, Vincennes\n\nNotre local est situé au **66 boulevard Soult, 75012 Paris**. La livraison est gratuite dans le 12e. Pour les zones limitrophes, un supplément modique peut s'appliquer.",
    cta: { label: "Voir la zone desservie", href: "/#zone" },
  },
  {
    keywords: ["délai", "delai", "temps", "durée", "duree", "quand", "récupérer", "recuperer", "combien de temps", "rapide", "vite"],
    question: "Quels sont les délais ?",
    answer: "Nous sommes rapides et fiables :\n\n• **Collecte** : possible en **30 minutes** après votre réservation\n• **Traitement** : votre linge est nettoyé sous **24 heures**\n• **Livraison** : gratuite, le **lendemain** de la collecte\n\nVous choisissez vos créneaux de collecte et de livraison lors de la réservation.",
  },
  {
    keywords: ["collecte", "ramass", "chercher", "venir", "passer", "récupér", "sac", "comment ça marche", "fonctionn", "étape", "processus"],
    question: "Comment fonctionne la collecte ?",
    answer: "C'est très simple, en **3 étapes** :\n\n1. **Réservez en ligne** : choisissez vos services et un créneau de collecte\n2. **Notre livreur passe** : il vient chercher votre linge à votre porte\n3. **Livraison le lendemain** : votre linge propre et plié est livré gratuitement\n\nPlacez simplement votre linge dans un sac (nous pouvons vous en fournir). Nous nous occupons du reste !",
    cta: { label: "Réserver une collecte", href: "/booking" },
  },
  {
    keywords: ["couette", "délicat", "soie", "cachemire", "laine", "cuir", "daim", "fragile", "spécial", "special", "robe", "costume", "manteau"],
    question: "Acceptez-vous les articles délicats ?",
    answer: "Absolument ! Nous traitons tous types de textiles :\n\n• **Nettoyage à sec** : costumes, manteaux, robes de soirée, soie, cachemire, laine\n• **Articles en cuir et daim** : traitement spécialisé\n• **Couettes et draps** : lavage professionnel adapté\n\nChaque article délicat est **inspecté individuellement** et traité avec les produits et techniques appropriés.",
  },
  {
    keywords: ["payer", "paiement", "carte", "cb", "visa", "mastercard", "apple pay", "google pay", "paypal", "sécuris"],
    question: "Comment payer ?",
    answer: "Le paiement est **100% sécurisé** et s'effectue en ligne lors de la réservation. Nous acceptons :\n\n• Cartes bancaires (Visa, Mastercard, CB)\n• Apple Pay\n• Google Pay\n\nVous êtes débité uniquement après validation de votre commande. Pas de mauvaise surprise !",
  },
  {
    keywords: ["professionnel", "entreprise", "b2b", "airbnb", "hôtel", "hotel", "restaurant", "volume", "devis", "facture"],
    question: "Proposez-vous des offres professionnelles ?",
    answer: "Oui ! **OMA SERVICES** accompagne les professionnels avec des solutions sur mesure :\n\n• Tarifs **dégressifs** selon le volume\n• **Facturation mensuelle** simplifiée\n• Collecte et livraison **quotidiennes** possibles\n• **Interlocuteur dédié**\n\nNous travaillons avec des Airbnb, hôtels, restaurants, cabinets médicaux et salles de sport.",
    cta: { label: "Demander un devis", href: "mailto:contact@oma-services.fr?subject=Demande de devis professionnel" },
  },
  {
    keywords: ["satisf", "garantie", "problème", "probleme", "réclamation", "reclamation", "qualité", "qualite", "abîmé", "abime", "perdu"],
    question: "Que faire si je ne suis pas satisfait ?",
    answer: "Votre satisfaction est notre **priorité absolue** :\n\n• Si le résultat ne vous convient pas, nous **retraitons votre linge gratuitement**\n• Vos vêtements sont **assurés** en cas de dommage pendant le traitement\n• Contactez-nous dans les **24h** suivant la livraison\n\nNotre équipe est à votre écoute pour résoudre tout problème rapidement.",
  },
  {
    keywords: ["horaire", "heure", "ouvert", "fermé", "ferme", "dimanche", "samedi", "lundi", "créneau", "creneau", "disponib"],
    question: "Quels sont vos horaires ?",
    answer: "Nous sommes disponibles **du lundi au samedi, de 8h à 20h**.\n\nVous pouvez réserver votre collecte en ligne 24h/24 et choisir le créneau qui vous convient le mieux. Les créneaux sont disponibles par tranches de 2 heures.",
    cta: { label: "Voir les créneaux disponibles", href: "/booking" },
  },
  {
    keywords: ["contact", "téléphone", "telephone", "appeler", "joindre", "email", "mail", "adresse"],
    question: "Comment vous contacter ?",
    answer: "Vous pouvez nous joindre facilement :\n\n• **Adresse** : 66 boulevard Soult, 75012 Paris\n• **Téléphone** : 01 23 45 67 89\n• **Email** : contact@oma-services.fr\n• **Horaires** : Lun-Sam, 8h-20h\n\nOu réservez directement en ligne, c'est rapide et simple !",
    cta: { label: "Réserver en ligne", href: "/booking" },
  },
  {
    keywords: ["réserv", "reserv", "command", "book"],
    question: "Comment réserver ?",
    answer: "Réserver est très simple et prend **moins de 2 minutes** :\n\n1. Entrez votre adresse\n2. Choisissez vos services\n3. Sélectionnez vos créneaux de collecte et livraison\n4. Confirmez et payez en ligne\n\nNotre livreur viendra chercher votre linge au créneau choisi !",
    cta: { label: "Réserver maintenant", href: "/booking" },
  },
];

// ==================== QUICK SUGGESTIONS ====================
const quickSuggestions = [
  "Quels sont vos tarifs ?",
  "Comment ça marche ?",
  "Intervenez-vous chez moi ?",
  "Quels sont les délais ?",
];

// ==================== MESSAGE TYPES ====================
interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  cta?: { label: string; href: string };
  timestamp: Date;
}

// ==================== FIND BEST ANSWER ====================
function findBestAnswer(input: string): FAQEntry | null {
  const normalized = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  let bestMatch: FAQEntry | null = null;
  let bestScore = 0;

  for (const entry of faqKnowledge) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(normalizedKeyword)) {
        score += normalizedKeyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

// ==================== FORMAT MARKDOWN ====================
function FormatMessage({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  
  return (
    <div className="space-y-1.5">
      {content.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        
        const formatted = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        });

        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span>{formatted.slice(0).map((f, idx) => {
                if (typeof f === 'object' && f.props?.children) return f;
                const text = typeof f === 'string' ? f : '';
                return <span key={idx}>{text.replace(/^[•\-]\s*/, '')}</span>;
              })}</span>
            </div>
          );
        }

        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-primary font-semibold shrink-0">{line.trim().match(/^\d+/)?.[0]}.</span>
              <span>{formatted.map((f, idx) => {
                if (typeof f === 'object' && f.props?.children) return f;
                const text = typeof f === 'string' ? f : '';
                return <span key={idx}>{text.replace(/^\d+\.\s*/, '')}</span>;
              })}</span>
            </div>
          );
        }

        return <p key={i}>{formatted}</p>;
      })}
    </div>
  );
}

// ==================== CHATBOT COMPONENT ====================
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setMessages([{
        id: "welcome",
        role: "bot",
        content: "Bonjour ! Je suis l'assistant d'**OMA SERVICES**.\n\nJe peux vous aider à réserver une collecte ou répondre à vos questions sur nos services de pressing premium dans le 12e arrondissement.",
        timestamp: new Date(),
      }]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, hasGreeted]);

  const addBotMessage = (content: string, cta?: { label: string; href: string }) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: "bot",
        content,
        cta,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    const match = findBestAnswer(messageText);
    if (match) {
      addBotMessage(match.answer, match.cta);
    } else {
      addBotMessage(
        "Merci pour votre question ! Je n'ai pas de réponse précise à vous donner sur ce sujet.\n\nVous pouvez :\n• **Nous appeler** au 01 23 45 67 89\n• **Nous écrire** à contact@oma-services.fr\n• **Réserver directement** en ligne\n\nNotre équipe se fera un plaisir de vous aider !",
        { label: "Réserver une collecte", href: "/booking" }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center group"
            aria-label="Ouvrir le chat"
          >
            <MessageCircle className="w-6 h-6" />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">OMA SERVICES</div>
                  <div className="text-xs text-white/70 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                    En ligne
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white border border-border/50 text-foreground rounded-bl-md shadow-sm"
                    }`}>
                      {msg.role === "bot" ? <FormatMessage content={msg.content} /> : msg.content}
                    </div>
                    {msg.cta && (
                      <div className="mt-2">
                        {msg.cta.href.startsWith("mailto:") ? (
                          <a href={msg.cta.href}>
                            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 px-4 border-primary text-primary hover:bg-primary hover:text-white">
                              {msg.cta.label}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        ) : msg.cta.href.startsWith("/") ? (
                          <Link href={msg.cta.href}>
                            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 px-4 border-primary text-primary hover:bg-primary hover:text-white">
                              {msg.cta.label}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        ) : (
                          <a href={msg.cta.href}>
                            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 px-4 border-primary text-primary hover:bg-primary hover:text-white">
                              {msg.cta.label}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 py-2 border-t border-border/30 bg-white shrink-0">
                <p className="text-xs text-muted-foreground mb-2">Questions fréquentes :</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(suggestion)}
                      className="text-xs bg-primary/5 text-primary border border-primary/20 rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/30 bg-white shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  className="rounded-full text-sm h-10 border-border/50 focus-visible:ring-primary/30"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
