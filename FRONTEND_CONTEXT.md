# SAKAI & PRIMENG DESIGN SYSTEM

## 1. Structure du Layout (Standalone)

Le layout principal a été porté en **Standalone Component** : `AppLayoutComponent` (`client/src/app/layout/app.layout.component.ts`).

### Hiérarchie DOM
```html
<app-layout>
  <p-toast></p-toast> <!-- Global Toast -->
  <div class="layout-wrapper" [ngClass]="containerClass">
    <!-- Topbar (Menu, Profile, Settings) -->
    <app-topbar></app-topbar>

    <!-- Sidebar (Menu de navigation) -->
    <app-sidebar></app-sidebar>

    <!-- Contenu Principal -->
    <div class="layout-main-container">
      <div class="layout-main">
        <router-outlet></router-outlet> <!-- Les pages s'affichent ici -->
      </div>
      <app-footer></app-footer>
    </div>

    <!-- Masque pour mobile -->
    <div class="layout-mask animate-fadein"></div>
  </div>
  <p-confirmDialog></p-confirmDialog> <!-- Global ConfirmDialog -->
</app-layout>
```

## 2. Palette & Thème

Le thème repose sur les variables CSS de PrimeNG, souvent surchargées ou mappées dans `client/src/assets/layout/variables/`.
Le projet utilise **Tailwind CSS** pour les couleurs utilitaires (ex: `bg-blue-100`, `text-surface-900`).

### Mode Sombre (Dark Mode)
- **Activation** : Ajout de la classe `.app-dark` sur la balise `<html>`.
- **Gestion** : Géré par `LayoutService`.

## 3. STANDARD CRUD UI (OBLIGATOIRE)

Toute nouvelle page CRUD doit **strictement** suivre ce modèle visuel et structurel (référence : `UsersComponent`).

### Structure "Raw" (Pas de wrapper inutile)
Ne pas envelopper le contenu dans des divs `grid` ou `card`. Commencer directement par la Toolbar.

```html
<!-- PAS DE <div class="card"> -->
<p-toast></p-toast>
<p-toolbar styleClass="mb-4">...</p-toolbar>
<p-table>...</p-table>
```

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

### Toolbar (Actions)
- **Style** : `styleClass="mb-4"`
- **Gauche** :
  - **Nouveau** : `<button pButton label="Nouveau" icon="pi pi-plus" class="p-button-success mr-2">`
  - **Supprimer** : `<button pButton label="Supprimer" icon="pi pi-trash" class="p-button-outlined p-button-secondary">`
- **Droite** :
  - **Export** : `<button pButton label="Export" icon="pi pi-upload" class="p-button-secondary">`

### Tableau de Données (`p-table`)
- **Configuration** : `[rows]="10" [paginator]="true" [alwaysShowPaginator]="false" responsiveLayout="scroll" styleClass="p-datatable-gridlines"`.
- **Caption (Header)** :
  - Conteneur : `flex items-center justify-between`
  - Titre : `h5` avec `m-0`
  - **Recherche** : Utiliser `<p-iconfield>` (PrimeNG v18+).
    ```html
    <p-iconfield class="p-iconfield p-iconfield-left">
        <p-inputicon styleClass="pi pi-search" />
        <input pInputText placeholder="Rechercher..." class="p-component p-inputtext" />
    </p-iconfield>
    ```
- **Colonnes** :
  - Checkboxes : `<p-tableHeaderCheckbox>` et `<p-tableCheckbox>`.
  - Badges : Utiliser `<p-tag>` avec `severity` ('danger', 'warning', 'info', 'success').

### Formulaires (Dialog)
- **Labels** : Classe `block font-bold mb-3`.
- **Inputs** : Classe `p-inputtext-fluid` (pour 100% width fluide).
- **Structure** :
```html
<div class="field">
    <label for="name" class="block font-bold mb-3">Nom</label>
    <input pInputText id="name" class="p-inputtext-fluid" />
</div>
```

## 4. Utilitaires CSS (Tailwind)

Le projet utilise **Tailwind CSS** pour la mise en page et l'espacement.

### Classes Fréquentes
- **Grid System** : `grid grid-cols-12 gap-4`.
- **Flexbox** : `flex`, `flex-col`, `items-center`, `justify-between`, `gap-2`.
- **Espacement** : `m-0`, `p-4`, `mb-4`.
- **Typographie** : `text-xl`, `font-semibold`, `text-center`, `text-surface-500`.

## 5. Architecture & Authentication

### Authentication System
L'authentification est gérée de manière réactive avec Angular Signals.
- **Service** : `AuthService` (`client/src/app/core/services/auth.service.ts`).
- **Guard** : `authGuard` et `roleGuard` (RBAC).

### Routing
Pattern Parent/Enfant avec `AppLayoutComponent` comme parent pour les routes protégées (`/admin`).

### Dashboard
Composant Standalone intégrant les widgets Sakai et les données utilisateur.

## 6. Gestion des conflits de styles Tailwind/PrimeNG

### Problème
Tailwind peut avoir une priorité plus élevée que PrimeNG, écrasant les styles des composants PrimeNG.

### Solution
1. Réorganiser l'ordre des imports dans `src/assets/styles.scss` :
   - PrimeNG styles d'abord
   - Tailwind ensuite
2. Utiliser `ViewEncapsulation.None` dans les composants critiques
3. Éventuellement utiliser `::ng-deep` pour les corrections locales

## 7. Configuration du proxy API

### Problème
Les requêtes API sont interceptées par le serveur de développement Angular au lieu d'être transmises au backend.

### Solution
1. Créer un fichier `proxy.conf.json`
2. Configurer le proxy vers le serveur backend (ex: `http://localhost:3000`)
3. Mettre à jour `angular.json` pour utiliser le proxy en développement