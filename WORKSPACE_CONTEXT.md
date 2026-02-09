# MEAN Stack Monorepo Workspace Context

This document provides a comprehensive analysis of the MEAN stack monorepo, detailing the project structure, technologies, and key components of both the frontend (client) and backend (server).

## High-Level Overview

This is a MEAN stack application featuring a modern **Angular 20+** frontend based on the **Sakai Ng** template (PrimeFaces) and a **Node.js/Express/Mongoose** backend. The project is structured as a monorepo with separate `client` and `server` directories. It implements CRUD functionality for Users (Admin only), Customers, Products, and Orders.

## Backend (`server/`)

The backend is a Node.js application using Express.js and Mongoose. It exposes a RESTful API for managing business entities.

-   **Framework**: Express.js 5.x
-   **Database**: MongoDB with Mongoose 9.x for object data modeling.
-   **Authentication**: **Implemented (JWT)**.
    -   RBAC (Role-Based Access Control): 'user', 'manager', 'admin'.
-   **Modules/Features**:
    -   **Auth**: Login, Register, Create Manager (Admin).
    -   **Users**: Full CRUD for User management (Admin only).
    -   **Customers**: Manages customer data.
    -   **Products**: Manages product inventory.
    -   **Orders**: Manages customer orders.
-   **Entry Point**: `app.js`

### API Endpoints (Prefix: `/api`)
-   **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/create-manager`
-   **Users**: `/api/users` (Protected: Admin only)
-   **Customers**: `/api/customers`
-   **Products**: `/api/products`
-   **Orders**: `/api/orders`

### Data Models
-   **User**: Email, Password, Name, Role (Enum: 'user', 'manager', 'admin').
-   **Customer**, **Product**, **Order**: Standard business entities.

## Frontend (`client/`) - Sakai Ng Template

The frontend is a single-page application (SPA) built with **Angular 20+** using the **Sakai Ng** template by PrimeFaces.

-   **Framework**: Angular 20+ (Standalone Components).
-   **State Management**: Angular Signals.
-   **UI Library**: **PrimeNG** (v20+) with **Tailwind CSS**.
-   **Design Standard**: **Sakai "Raw" CRUD**.
    -   New pages must follow the `UsersComponent` design pattern strictly.

### Application Structure (`client/src/app/`)

-   **`layout/`**: `AppLayoutComponent` (Standalone Shell) with `Toast` and `ConfirmDialog` integrated.
-   **`pages/`**:
    -   `dashboard/`: Admin Dashboard.
    -   `admin/users/`: **Reference CRUD implementation**.
    -   `auth/`: Login/Register.
-   **`core/`**:
    -   `services/`: `AuthService`, `UserService`.
    -   `guards/`: `authGuard`, `roleGuard`.
    -   `directives/`: `HasRoleDirective`.

### Routing

-   **`app.routes.ts`**:
    -   `login`: Public.
    -   `admin`: Protected Shell (`AppLayoutComponent`).
        -   `dashboard`: Admin Dashboard.
        -   `users`: User Management (Admin only).

## UI & UX Guidelines (NEW STANDARD)

**All new CRUD pages must mimic the `UsersComponent` design:**

1.  **Layout**: No outer `card` wrapper. Start with `p-toolbar`.
2.  **Toolbar**: `mb-4`. Success button for "New", Outlined/Secondary for "Delete".
3.  **Table**: `p-iconfield` for Search. `p-tag` for statuses. `responsiveLayout="scroll"`.
4.  **Forms**: `p-inputtext-fluid` on inputs. Bold labels.

### Services & API
-   **Providers**: `MessageService` and `ConfirmationService` are provided in `AppLayoutComponent` for scoping.
-   **Chart.js**: Registered globally in `app.config.ts`.

## CRUD Development Process

### Étapes de création d'un CRUD complet

#### Étape 1 : Création du Service
1. Créer un service standalone avec `providedIn: 'root'`
2. Définir l'endpoint API (ex: `/api/ressources`)
3. Implémenter les méthodes CRUD : `getRessources()`, `createRessource()`, `updateRessource()`, `deleteRessource()`
4. Définir le modèle TypeScript correspondant

#### Étape 2 : Création du Composant
1. Utiliser `ViewEncapsulation.None` pour éviter les conflits Tailwind/PrimeNG
2. Importer tous les modules PrimeNG nécessaires
3. Implémenter la logique CRUD complète (signals ou variables classiques)
4. Gérer l'état de chargement avec `isLoading`
5. Utiliser `MessageService` pour les notifications

#### Étape 3 : Création du Template HTML
1. Suivre la structure "Raw" sans wrapper
2. Utiliser `p-toolbar` avec les boutons standard
3. Configurer `p-table` avec pagination, recherche et sélection multiple
4. Ajouter le template de chargement avec `p-skeleton`
5. Créer les dialogues pour les formulaires

#### Étape 4 : Gestion des Styles
1. Réorganiser l'ordre des imports CSS pour que PrimeNG précède Tailwind
2. Éventuellement utiliser `::ng-deep` pour les corrections locales si nécessaire

#### Étape 5 : Configuration du Proxy API
1. Créer un fichier `proxy.conf.json` pour rediriger les requêtes `/api` vers le backend
2. Mettre à jour `angular.json` pour utiliser le proxy en développement
3. Tester que les requêtes API atteignent bien le serveur backend

### Common Issues & Solutions

#### Problème de conflits de styles Tailwind/PrimeNG
- **Symptôme**: Les styles Tailwind écrasent les styles PrimeNG
- **Solution**: Réorganiser l'ordre des imports CSS dans `src/assets/styles.scss`

#### Problème de requêtes API interceptées par le serveur Angular
- **Symptôme**: Les requêtes API retournent du HTML au lieu de JSON
- **Solution**: Configurer le proxy API pour rediriger vers le backend

#### Problème d'import TypeScript
- **Symptôme**: Erreurs "Cannot find module" pendant la compilation
- **Solution**: Vérifier les chemins d'import et utiliser les alias `@/*` définis dans tsconfig.json

#### Problème de compatibilité PrimeNG v20+
- **Symptôme**: Composants PrimeNG introuvables
- **Solution**: Vérifier les nouveaux noms de modules (ex: `primeng/select` au lieu de `primeng/dropdown`)