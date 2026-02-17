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
        }

        if (user?.role === 'manager') {
            // Manager only items as requested
            // "Dashboard" replaces "Mes Magasins"
            mainMenuItems.push({ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/store-settings'] });
            mainMenuItems.push({ label: 'Magasins', icon: 'pi pi-fw pi-building', routerLink: ['/admin/stores'] });
            mainMenuItems.push({ label: 'Produits', icon: 'pi pi-fw pi-box', routerLink: ['/admin/products'] });
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