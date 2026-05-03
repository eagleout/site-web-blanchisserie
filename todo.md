# Project TODO - Blanchisserie Paris 12

## Design System & Configuration
- [x] Design system premium (couleurs, typographie, animations)
- [x] Configuration Tailwind avec palette premium
- [x] Google Fonts (Inter + Playfair Display)

## Base de données
- [x] Schéma DB : tables services, tarifs, créneaux, commandes, adresses, articles commande
- [x] Migration SQL et seed data initiales
- [x] Helpers DB (requêtes Drizzle)

## Backend API (tRPC)
- [x] API services : liste des services et tarifs
- [x] API créneaux : disponibilité temps réel collecte/livraison
- [x] API commandes : création, mise à jour statut, historique
- [x] API adresses : CRUD adresses client
- [x] API admin : gestion commandes, services, tarifs, créneaux
- [x] Calcul automatique des prix (type service, poids, options)

## Page d'accueil marketing
- [x] Hero section avec CTA conversion
- [x] Section "Comment ça marche" (3 étapes)
- [x] Section services (lavage, repassage, nettoyage à sec)
- [x] Section tarifs
- [x] Section zone desservie (Paris 12)
- [x] Section témoignages clients (slider)
- [x] Section FAQ
- [x] Section CTA final
- [x] Header sticky avec navigation
- [x] Footer complet

## Tunnel de réservation (8 étapes)
- [x] Étape 1 : Saisie adresse et code postal
- [x] Étape 2 : Sélection services (lavage standard/premium, repassage, nettoyage)
- [x] Étape 3 : Configuration service (tri, température, poids estimé)
- [x] Étape 4 : Créneau collecte (calendrier + heure)
- [x] Étape 5 : Créneau livraison
- [x] Étape 6 : Informations client (prénom, nom, téléphone, email)
- [x] Étape 7 : Paiement sécurisé
- [x] Étape 8 : Confirmation commande
- [x] Panier dynamique avec calcul prix temps réel
- [x] Barre de progression visuelle

## Panneau d'administration
- [x] Dashboard avec statistiques (commandes, revenus, clients)
- [x] Gestion commandes avec statuts (en attente, collectée, en cours, livrée)
- [x] Gestion services et tarifs
- [x] Gestion créneaux disponibles
- [x] Liste clients

## Authentification & Comptes clients
- [x] Authentification via Manus OAuth
- [x] Page compte client : historique commandes
- [x] Page compte client : adresses enregistrées

## Responsive & UX
- [x] Design responsive mobile-first
- [x] Animations fluides (Framer Motion)
- [x] SEO optimisé (meta, H1, H2, alt)

## Tests
- [x] Tests unitaires Vitest pour les API backend (21 tests, tous passent)

## Audit QA Complet
- [x] Audit visuel page d'accueil (desktop + mobile)
- [x] Test tunnel de réservation complet (8 étapes)
- [x] Implémentation autocomplétion adresse Google Places
- [x] Correction bugs critiques détectés
- [x] Correction problèmes UX détectés
- [x] Test panneau d'administration
- [x] Tests de régression après corrections
- [x] Rapport d'audit final

## Rebranding OMA SERVICES & Marketing
- [x] Remplacer "BlanchisserieParis12" par "OMA SERVICES" partout (header, footer, meta, pages)
- [x] Intégrer adresse 66 boulevard Soult, 75012 Paris dans footer et contact
- [x] Mettre à jour les meta tags SEO avec OMA SERVICES
- [x] Améliorer le copywriting page d'accueil (confiance, premium, conversion)
- [x] Améliorer les éléments de réassurance (badges, garanties, avis)
- [x] Améliorer les CTA pour maximiser la conversion
- [x] Optimiser la section tarifs pour plus de clarté
- [x] Ajouter des éléments de crédibilité (années d'expérience, nombre de clients)

## Chatbot Intelligent
- [x] Créer le composant ChatBot avec IA
- [x] Intégrer les réponses aux questions fréquentes (tarifs, zone, délais, paiement)
- [x] Ajouter la redirection vers la réservation
- [x] Style premium cohérent avec le design du site
- [x] Message d'accueil chaleureux et professionnel
- [x] Bouton flottant en bas à droite

## Corrections v3
- [x] Générer image professionnelle : Lavage & Pliage (linge propre plié)
- [x] Générer image professionnelle : Repassage (chemise repassée)
- [x] Générer image professionnelle : Nettoyage à sec (costume sur cintre)
- [x] Générer image professionnelle : Linge de maison (couette/draps blancs)
- [x] Intégrer les images dans la section services de la page d'accueil
- [x] Corriger chatbot mobile : masquer pendant le tunnel de réservation
- [x] Implémenter système d'email de confirmation automatique (notification intégrée)
- [x] Email contenant : numéro commande, services, dates collecte/livraison, prix total
- [x] Optimisation pour déploiement public (build production)
