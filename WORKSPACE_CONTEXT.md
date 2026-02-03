# MEAN Stack Monorepo Workspace Context

This document provides a comprehensive analysis of the MEAN stack monorepo, detailing the project structure, technologies, and key components of both the frontend (client) and backend (server).

## High-Level Overview

This is a MEAN stack application featuring a modern **Angular 20+** frontend based on the **Sakai Ng** template (PrimeFaces) and a **Node.js/Express/Mongoose** backend. The project is structured as a monorepo with separate `client` and `server` directories. It implements basic CRUD (Create, Read, Update, Delete) functionality for main features like Customers, Products, and Orders.

## Backend (`server/`)

The backend is a Node.js application using Express.js and Mongoose. It exposes a RESTful API for managing business entities.

-   **Framework**: Express.js 5.x
-   **Database**: MongoDB with Mongoose 9.x for object data modeling.
-   **API Style**: RESTful API with standard HTTP methods.
-   **Authentication**: None (currently).
-   **Modules/Features**:
    -   **Customers**: Manages customer data.
    -   **Products**: Manages product inventory.
    -   **Orders**: Manages customer orders, linking customers and products.
-   **Entry Point**: `app.js`
-   **Configuration**: Environment variables are loaded from a `.env` file (e.g., `PORT`, `MONGODB_URI`).

### API Endpoints (Prefix: `/api`)
-   **Customers**: `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/:id`
-   **Products**: `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`
-   **Orders**: `GET/POST /api/orders`, `GET/PUT/DELETE /api/orders/:id`

### Data Models
-   **Customer**: Name, Email (unique), Phone, Address.
-   **Product**: Name, Description, Price, Quantity.
-   **Order**: Customer (Ref), Products (Array of Refs + Quantity), Total, Status (Pending/Shipped/etc.), CreatedAt.

## Frontend (`client/`) - Sakai Ng Template

The frontend is a single-page application (SPA) built with **Angular 20+** using the **Sakai Ng** template by PrimeFaces.

-   **Framework**: Angular 20+ (Standalone Components).
-   **UI Library**: **PrimeNG** (v20+) with **Tailwind CSS** for utility styling.
-   **Template**: Sakai Ng (Tag v20.0.0).
-   **Language**: TypeScript.
-   **HTTP Client**: `@angular/common/http`.

### Application Structure (`client/src/app/`)

-   **`layout/`**: Contains the core application layout components.
    -   `component/app.layout.ts`: Main layout wrapper.
    -   `component/app.topbar.ts`: Top navigation bar.
    -   `component/app.sidebar.ts`: Sidebar navigation.
    -   `component/app.menu.ts`: Main menu configuration.
    -   `component/app.footer.ts`: Application footer.
-   **`pages/`**: Contains the main application views/pages.
    -   `dashboard/`: Dashboard view.
    -   `crud/`: Example CRUD implementation (good reference).
    -   `auth/`: Authentication pages (Login, Error, Access Denied).
    -   *(New features should be added here, e.g., `pages/customers/`)*.
-   **`demo/`**: Contains demo components and services provided by Sakai (Reference only).
-   **`assets/`**: Static assets and **Sakai Styles**.
    -   `layout/styles/`: Core SCSS files for the theme (`_variables.scss`, etc.).

### Routing

-   **`app.routes.ts`**: Main routing configuration.
-   Uses lazy loading for feature modules/components.
-   Routes are typically children of the `AppLayout` component to inherit the main structure.

## Page Generation Guidelines (Sakai UI)

When creating new pages or features, strictly follow the **Sakai Ng** and **PrimeNG** patterns to ensure UI consistency.

### 1. Component Structure
-   Create components in `client/src/app/pages/<feature-name>/`.
-   Use **Standalone Components** (`standalone: true`).
-   Import necessary PrimeNG modules directly in the `imports` array (e.g., `TableModule`, `ButtonModule`, `InputTextModule`).

### 2. General Page Template
Wrap your page content in a standard grid layout with a card.

```html
<div class="grid">
    <div class="col-12">
        <div class="card">
            <h5>Page Title</h5>
            <p>Page description or content goes here.</p>
            
            <!-- PrimeNG Components -->
            <p-table [value]="data" ...>
                ...
            </p-table>
        </div>
    </div>
</div>
```

### 3. CRUD Page Pattern
For list/detail views (like Customers/Products), refer to `client/src/app/pages/crud/crud.ts` as the gold standard.

-   **Toolbar**: Use `<p-toolbar>` for actions like "New" (Left) and "Export" (Right).
-   **Table**: Use `<p-table>` with:
    -   `[value]`, `[paginator]="true"`, `[rows]="10"`.
    -   `styleClass="p-datatable-gridlines"` (optional).
    -   Global search input in the caption.
-   **Dialogs**: Use `<p-dialog>` for Create/Edit forms to keep context.
-   **Toast**: Use `<p-toast>` for success/error notifications.
-   **Confirmations**: Use `<p-confirmDialog>` for delete actions.

### 4. Form Design
-   Use `p-fluid` class on the form container for responsive, 100% width inputs.
-   **Inputs**: Standard PrimeNG inputs (`input[pInputText]`, `p-inputNumber`, `p-dropdown`).
-   **Validation**: Display validation errors below inputs using `<small class="p-error">`.

### 5. Services & API
-   Create services in `client/src/app/service/` or feature-specific folders.
-   Extend the backend API interaction pattern.
-   Use `environment` variables for API base URLs.

### 6. Menu Update
-   To make the page accessible, add it to the sidebar menu in **`client/src/app/layout/component/app.menu.ts`**.

```typescript
// app.menu.ts
this.model = [
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }
        ]
    },
    {
        label: 'Business',
        items: [
            { label: 'Customers', icon: 'pi pi-fw pi-users', routerLink: ['/customers'] },
            // Add new items here
        ]
    },
    // ...
];
```
