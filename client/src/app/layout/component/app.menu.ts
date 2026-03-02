import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    private authService = inject(AuthService);
    model: MenuItem[] = [];

    ngOnInit() {
        const user = this.authService.currentUser();
        const mainMenuItems: MenuItem[] = [];

        if (user?.role === 'admin') {
            mainMenuItems.push({ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] });
            mainMenuItems.push({ label: 'Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] });
            mainMenuItems.push({ label: 'Loyers', icon: 'pi pi-fw pi-money-bill', routerLink: ['/admin/rents'] });
        }

        if (user?.role === 'manager') {
            mainMenuItems.push({ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/store-settings'] });
            mainMenuItems.push({ label: 'Mes Magasins', icon: 'pi pi-fw pi-shop', routerLink: ['/admin/stores'] });
            mainMenuItems.push({ label: 'Produits', icon: 'pi pi-fw pi-box', routerLink: ['/admin/products'] });
            mainMenuItems.push({ label: 'Promotions', icon: 'pi pi-fw pi-tags', routerLink: ['/admin/promotions'] });
            mainMenuItems.push({ label: 'Stock', icon: 'pi pi-fw pi-sync', routerLink: ['/admin/stock'] });
        }

        this.model = [
            {
                label: 'Menu Principal',
                items: mainMenuItems
            },
            {
                label: 'Compte',
                items: [
                    { label: 'Se déconnecter', icon: 'pi pi-fw pi-power-off', command: () => this.authService.logout() }
                ]
            }
        ];
    }
}