# SAKAI & PRIMENG DESIGN SYSTEM

## 1. Structure du Layout

Le layout principal est géré par le composant `AppLayout` (`client/src/app/layout/component/app.layout.ts`).

### Hiérarchie DOM
```html
<app-layout>
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
</app-layout>
```

### Classes Clés
- `.layout-wrapper`: Conteneur racine.
- `.layout-sidebar`: Sidebar de navigation.
- `.layout-main-container`: Wrapper du contenu (scrollable).
- `.layout-main`: Conteneur direct des pages.
- `.layout-mask`: Overlay sombre pour le menu mobile.

## 2. Palette & Thème

Le thème repose sur les variables CSS de PrimeNG, souvent surchargées ou mappées dans `client/src/assets/layout/variables/`.
Le projet utilise **Tailwind CSS** pour les couleurs utilitaires (ex: `bg-blue-100`, `text-surface-900`).

### Variables CSS Principales
Les variables sont définies dans `:root` et s'adaptent au thème (Light/Dark).

| Variable CSS | Usage | Équivalent PrimeNG |
| :--- | :--- | :--- |
| `--surface-card` | Fond des cartes/conteneurs | `var(--p-content-background)` |
| `--surface-ground` | Fond de la page | `var(--p-surface-100)` / `950` (Dark) |
| `--primary-color` | Couleur principale | `var(--p-primary-color)` |
| `--text-color` | Texte principal | `var(--p-text-color)` |
| `--text-color-secondary` | Texte secondaire | `var(--p-text-muted-color)` |

### Mode Sombre (Dark Mode)
- **Activation** : Ajout de la classe `.app-dark` sur la balise `<html>` (`document.documentElement`).
- **Gestion** : Géré par `LayoutService` (`toggleDarkMode`).
- **Styles** : Définis dans `_dark.scss`.
  ```css
  :root[class*='app-dark'] {
      --surface-ground: var(--p-surface-950);
      /* ... */
  }
  ```

## 3. Composants UI Patterns (PrimeNG)

### Card (Carte Standard)
Utiliser simplement la classe `.card` (CSS utilitaire Sakai). Ne pas utiliser `<p-card>` sauf besoin spécifique.

```html
<div class="card">
    <div class="font-semibold text-xl mb-4">Titre de la Carte</div>
    <p>Contenu de la carte...</p>
</div>
```

### Tableau de Données (p-table)
Style "Clean" avec tri et responsive.

```html
<div class="card">
    <div class="font-semibold text-xl mb-4">Liste des Utilisateurs</div>
    <p-table [value]="users" [paginator]="true" [rows]="10" responsiveLayout="scroll">
        <ng-template #header>
            <tr>
                <th pSortableColumn="name">Nom <p-sortIcon field="name"></p-sortIcon></th>
                <th>Actions</th>
            </tr>
        </ng-template>
        <ng-template #body let-user>
            <tr>
                <td>{{ user.name }}</td>
                <td>
                    <button pButton icon="pi pi-search" class="p-button-text p-button-rounded"></button>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>
```

### Formulaire (Standard PrimeNG)
Utiliser `pInputText`, `p-fluid` pour le responsive, et `p-floatlabel` (optionnel) ou des labels classiques.
*Note: Le projet utilise `p-fluid` pour étendre les champs à 100% de la largeur.*

```html
<p-fluid class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="field">
        <label for="username">Nom d'utilisateur</label>
        <input pInputText id="username" type="text" />
    </div>
    
    <div class="field">
        <label for="role">Rôle</label>
        <p-dropdown [options]="roles" placeholder="Sélectionner un rôle"></p-dropdown>
    </div>
</p-fluid>
```

### Boutons
Utiliser les directives `pButton` et `pRipple`.

```html
<!-- Bouton standard -->
<button pButton pRipple label="Valider" class="p-button-primary"></button>

<!-- Bouton icône seulement, textuel -->
<button pButton pRipple icon="pi pi-trash" class="p-button-text p-button-danger p-button-icon-only"></button>

<!-- Bouton arrondi -->
<button pButton pRipple label="Arrondi" class="p-button-rounded"></button>
```

## 4. Utilitaires CSS (Tailwind)

Le projet utilise **Tailwind CSS** pour la mise en page et l'espacement, plutôt que PrimeFlex.

### Classes Fréquentes
- **Grid System** : `grid grid-cols-12 gap-4`, `col-span-12 md:col-span-6`.
- **Flexbox** : `flex`, `flex-col`, `items-center`, `justify-between`, `gap-2`.
- **Espacement** : `m-0`, `p-4`, `mb-4` (Standard Tailwind).
- **Typographie** : `text-xl`, `font-semibold`, `text-center`, `text-surface-500`.

### Exemple de Widget (Stats)
```html
<div class="col-span-12 lg:col-span-6 xl:col-span-3">
    <div class="card mb-0">
        <div class="flex justify-between mb-4">
            <div>
                <span class="block text-surface-500 font-medium mb-3">Revenu</span>
                <div class="text-surface-900 font-medium text-xl">$2,100</div>
            </div>
            <!-- Icône avec fond coloré -->
            <div class="flex items-center justify-center bg-orange-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                <i class="pi pi-dollar text-orange-500 text-xl"></i>
            </div>
        </div>
    </div>
</div>
```
