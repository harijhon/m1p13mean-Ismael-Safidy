import { Routes } from '@angular/router';
import { authGuard } from './app/core/guards/auth.guard';
import { roleGuard } from './app/core/guards/role.guard';
import { redirectGuard } from './app/core/guards/redirect.guard';
import { AppLayoutComponent } from './app/layout/app.layout.component';
import { StoreLayoutComponent } from './app/layout/store/store-layout.component';

export const appRoutes: Routes = [
    {
        path: '',
        canActivate: [redirectGuard],
        children: [] // Cette route sera gérée par le guard de redirection
    },
    {
        path: 'login',
        loadComponent: () => import('./app/pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./app/pages/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'store',
        component: StoreLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./app/features/store/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'product/:id',
                loadComponent: () => import('./app/features/store/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
            },
            {
                path: 'cart',
                loadComponent: () => import('./app/features/store/cart/cart.component').then(m => m.CartComponent)
            },
            {
                path: 'checkout',
                loadComponent: () => import('./app/features/store/checkout/checkout.component').then(m => m.CheckoutComponent)
            }
        ]
    },
    {
        path: 'profile',
        component: StoreLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./app/features/store/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./app/features/store/profile/order-history/order-history.component').then(m => m.OrderHistoryComponent)
            }
        ]
    },
    {
        path: 'admin',
        component: AppLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./app/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./app/pages/admin/users/users.component').then(m => m.UsersComponent),
                canActivate: [roleGuard],
                data: { roles: ['admin'] }
            },
            {
                path: 'products',
                loadComponent: () => import('./app/pages/admin/products/products.component').then(m => m.ProductsComponent),
                canActivate: [roleGuard],
                data: { roles: ['admin', 'manager'] }
            },
            {
                path: 'store-settings',
                loadComponent: () => import('./app/pages/admin/store-settings/store-settings.component').then(m => m.StoreSettingsComponent),
                canActivate: [roleGuard],
                data: { roles: ['admin', 'manager'] }
            },
            {
                path: 'promotions',
                loadComponent: () => import('./app/pages/admin/promotions/promotions.component').then(m => m.PromotionsComponent),
                canActivate: [roleGuard],
                data: { roles: ['manager'] }
            },
            {
                path: 'stores',
                loadComponent: () => import('./app/pages/admin/stores/stores.component').then(m => m.StoresComponent),
                canActivate: [roleGuard],
                data: { roles: ['admin', 'manager'] }
            },
            {
                path: 'stock',
                loadComponent: () => import('./app/pages/admin/stock/stock').then(m => m.Stock),
                canActivate: [roleGuard],
                data: { roles: ['manager'] }
            }
        ]
    }
];