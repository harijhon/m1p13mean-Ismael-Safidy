# DEBUGGING REPORT - Application MEAN Stack

## Mission
Identifier, analyser et résoudre les bugs rencontrés lors du développement de l'application MEAN Stack avec frontend Angular/Sakai et backend Node.js/MongoDB.

---

## Bug #1: Conflit de styles Tailwind vs PrimeNG

### Symptômes
- Les composants PrimeNG avaient des styles écrasés par Tailwind
- Les boutons, inputs et autres éléments UI avaient un rendu incorrect
- Le design Sakai n'était pas respecté

### Cause racine
- Dans `src/assets/styles.scss`, Tailwind était importé **avant** les styles PrimeNG
- Cela donnait à Tailwind une priorité plus élevée dans la cascade CSS
- Les sélecteurs Tailwind écrasaient les styles PrimeNG

### Solution appliquée
- Réorganisation de l'ordre des imports dans `src/assets/styles.scss` :
  ```scss
  @use './layout/layout.scss';      // PrimeNG styles d'abord
  @use 'primeicons/primeicons.css';
  @use './demo/demo.scss';
  @use './tailwind.css';            // Tailwind ensuite (priorité moindre)
  ```

### Résultat
- Les composants PrimeNG affichent maintenant correctement
- Le design Sakai est respecté
- Meilleure cohérence visuelle

---

## Bug #2: Requêtes API interceptées par le serveur Angular

### Symptômes
- Les requêtes HTTP vers `/api/*` retournaient du HTML (index.html) au lieu de JSON
- Erreur: `"Http failure during parsing for http://localhost:4200/api/users"`
- Le frontend recevait une réponse HTML au lieu des données attendues
- L'AuthInterceptor ajoutait bien le token, mais la requête n'atteignait pas le backend

### Cause racine
- Le serveur de développement Angular (dev-server) interceptait les requêtes API
- Aucune configuration de proxy n'était activée pour rediriger vers le backend
- Les requêtes étaient traitées comme des routes d'application Angular

### Solution appliquée
1. Création de `proxy.conf.json` :
   ```json
   {
     "/api": {
       "target": "http://localhost:3000",
       "secure": false,
       "changeOrigin": true,
       "logLevel": "debug"
     }
   }
   ```

2. Mise à jour de `angular.json` pour utiliser le proxy en développement

3. Démarrage du serveur Angular avec `--proxy-config proxy.conf.json`

### Résultat
- Les requêtes `/api/*` sont maintenant correctement redirigées vers le backend
- Le code 401 reçu indique que la requête atteint bien le backend
- L'authentification JWT fonctionne comme prévu

---

## Bug #3: Erreurs de compilation TypeScript - Modules introuvables

### Symptômes
- Erreurs: `TS2307: Cannot find module '../../core/services/user.service'`
- Erreur: `NG2003: No suitable injection token for parameter 'userService'`
- Le build Angular échouait

### Cause racine
- Utilisation d'import relatifs au lieu des alias `@/*` définis dans `tsconfig.json`
- Dans PrimeNG v20+, certains composants ont changé de nom (ex: `dropdown` → `select`)

### Solution appliquée
1. Remplacement des imports relatifs par les alias `@/*` :
   ```typescript
   // Avant
   import { UserService } from '../../core/services/user.service';
   
   // Après
   import { UserService } from '@/core/services/user.service';
   ```

2. Mise à jour des imports PrimeNG v20+ :
   ```typescript
   // Avant
   import { DropdownModule } from 'primeng/dropdown';
   
   // Après
   import { SelectModule } from 'primeng/select';
   ```

### Résultat
- Le build Angular réussit sans erreurs
- Tous les modules sont correctement résolus
- Meilleure maintenabilité avec les imports absolus

---

## Bug #4: Interface User non conforme

### Symptômes
- Erreur: `TS2739: Type '{}' is missing the following properties from type 'User': name, email, role`
- Impossible d'assigner `{}` à une variable de type `User`

### Cause racine
- L'interface `User` exigeait des propriétés obligatoires (`name`, `email`, `role`)
- Assignation d'objets vides `{}` là où un objet `User` complet était attendu

### Solution appliquée
- Initialisation correcte des objets User avec valeurs par défaut :
  ```typescript
  // Avant
  user: User = {};
  
  // Après
  user: User = { name: '', email: '', role: 'user' };
  ```

### Résultat
- Plus d'erreurs de type TypeScript
- Conformité avec l'interface User
- Meilleure gestion des valeurs initiales

---

## Bug #5: Structure HTML non conforme au standard Sakai

### Symptômes
- Le composant avait des divs wrapper inutiles (`grid`, `col-12`, `card`)
- Le design ne respectait pas le standard "Raw CRUD" Sakai
- Moins de cohérence avec les autres pages de l'application

### Cause racine
- Copie de structure générique plutôt que respect du standard Sakai
- Mauvaise compréhension des directives de conception

### Solution appliquée
- Suppression des divs wrapper inutiles
- Structure directe avec `p-toast`, `p-toolbar`, `p-table`
- Respect du standard "Raw CRUD" Sakai

### Résultat
- Conformité avec le design Sakai
- Meilleure cohérence avec les autres pages CRUD
- Interface plus propre et plus professionnelle

---

## Bonnes pratiques identifiées

### 1. Gestion des conflits de styles
- Toujours charger les styles UI (PrimeNG) avant les utilitaires (Tailwind)
- Utiliser `ViewEncapsulation.None` pour les composants critiques
- Éviter les `!important` sauf cas exceptionnels

### 2. Configuration du proxy API
- Toujours configurer un proxy pour rediriger `/api/*` vers le backend
- Tester la configuration avec des requêtes cURL
- Vérifier que le backend est en cours d'exécution

### 3. Imports TypeScript
- Préférer les imports absolus avec alias `@/*`
- Vérifier la compatibilité des versions PrimeNG
- Garder les interfaces strictes mais réalisables

### 4. Standards de conception Sakai
- Suivre le modèle "Raw CRUD" sans wrappers inutiles
- Respecter la structure `p-toast` → `p-toolbar` → `p-table`
- Maintenir la cohérence visuelle avec les autres pages