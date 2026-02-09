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
        const isAdmin = this.authService.isAdmin();
        this.model = [
            {
                label: 'Menu Principal',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] },
                    ...(isAdmin ? [{ label: 'Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] }] : [])
                ]
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