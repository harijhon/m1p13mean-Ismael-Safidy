import { Routes } from '@angular/router';
import { authGuard } from './app/core/guards/auth.guard';
import { roleGuard } from './app/core/guards/role.guard';
import { AppLayoutComponent } from './app/layout/app.layout.component';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./app/pages/auth/login/login.component').then(m => m.LoginComponent)
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
            }
        ]
    }
];