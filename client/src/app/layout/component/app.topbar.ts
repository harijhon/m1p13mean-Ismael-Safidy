import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../service/layout.service';
import { StoreSwitcherComponent } from './store-switcher.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, StoreSwitcherComponent, PopoverModule, ButtonModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467ZM33.3284 11.4538C31.6493 10.2396 29.5855 9.52381 27.3546 9.52381C25.1195 9.52381 23.0524 10.2421 21.3717 11.4603C20.0078 11.3232 18.6475 11.1387 17.2933 10.907C19.7453 8.11308 23.3438 6.34921 27.3546 6.34921C31.36 6.34921 34.9543 8.10844 37.4061 10.896C36.0521 11.1292 34.692 11.3152 33.3284 11.4538ZM43.826 18.0518C43.881 18.6003 43.9091 19.1566 43.9091 19.7194C43.9091 28.8568 36.4973 36.2642 27.3546 36.2642C18.2117 36.2642 10.8 28.8568 10.8 19.7194C10.8 19.1615 10.8276 18.61 10.8816 18.0663L7.75383 17.4411C7.66775 18.1886 7.62354 18.9488 7.62354 19.7194C7.62354 30.6102 16.4574 39.4388 27.3546 39.4388C38.2517 39.4388 47.0855 30.6102 47.0855 19.7194C47.0855 18.9439 47.0407 18.1789 46.9536 17.4267L43.826 18.0518ZM44.2613 9.54743L40.9084 10.2176C37.9134 5.95821 32.9593 3.1746 27.3546 3.1746C21.7442 3.1746 16.7856 5.96385 13.7915 10.2305L10.4399 9.56057C13.892 3.83178 20.1756 0 27.3546 0C34.5281 0 40.8075 3.82591 44.2613 9.54743Z"
                        fill="var(--primary-color)"
                    />
                    <mask id="mask0_1413_1551" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="8" width="54" height="11">
                        <path d="M27 18.3652C10.5114 19.1944 0 8.88892 0 8.88892C0 8.88892 16.5176 14.5866 27 14.5866C37.4824 14.5866 54 8.88892 54 8.88892 43.4886 17.5361 27 18.3652Z" fill="var(--primary-color)" />
                    </mask>
                    <g mask="url(#mask0_1413_1551)">
                        <rect width="54" height="40" fill="var(--primary-color)" />
                    </g>
                </svg>
                <span>SAKAI</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <app-store-switcher></app-store-switcher>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <!-- Notification Bell with Tailwind Badge -->
                    <button type="button" class="layout-topbar-action relative" (click)="op.toggle($event)">
                        <i class="pi pi-bell"></i>
                        <div *ngIf="getUnreadCount() !== '0'" class="absolute top-[2px] right-[2px] w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface-0 border-solid shadow-sm">
                            {{ getUnreadCount() }}
                        </div>
                        <span>Notifications</span>
                    </button>
                    
                    <p-popover #op styleClass="w-full sm:w-[25rem]">
                        <div class="p-3">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-xl font-bold">Notifications</span>
                                <button *ngIf="notificationService.notifications().length > 0" pButton pRipple label="Tout marquer comme lu" class="p-button-text p-button-sm text-primary" (click)="markAllAsRead()"></button>
                            </div>
                            
                            <div *ngIf="notificationService.notifications().length === 0" class="text-center p-4 text-surface-500">
                                Aucune notification récente.
                            </div>
                            
                            <div class="flex flex-col max-h-[25rem] overflow-y-auto">
                                <div *ngFor="let notif of notificationService.notifications()" 
                                     class="p-3 border-b border-surface-200 cursor-pointer hover:bg-surface-50 transition-colors"
                                     [class.bg-blue-50]="!notif.isRead"
                                     (click)="markAsRead(notif._id)">
                                    <div class="flex items-start gap-3">
                                        <i class="pi text-xl mt-1" 
                                           [class.pi-info-circle]="notif.type === 'GENERAL'"
                                           [class.pi-box]="notif.type === 'BOX_REQUEST'"
                                           [class.pi-check-circle]="notif.type === 'STORE_VALIDATED'"
                                           [class.pi-exclamation-triangle]="notif.type === 'PRE_NOTICE_ALERT'"
                                           [class.text-blue-500]="notif.type === 'GENERAL'"
                                           [class.text-orange-500]="notif.type === 'BOX_REQUEST'"
                                           [class.text-green-500]="notif.type === 'STORE_VALIDATED'"
                                           [class.text-red-500]="notif.type === 'PRE_NOTICE_ALERT'">
                                        </i>
                                        <div class="flex-1">
                                            <p class="m-0 text-surface-900 leading-tight" [class.font-semibold]="!notif.isRead">{{ notif.message }}</p>
                                            <span class="text-xs text-surface-500 mt-1 block">{{ notif.createdAt | date:'short' }}</span>
                                        </div>
                                        <div *ngIf="!notif.isRead" class="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-popover>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    public notificationService = inject(NotificationService);

    constructor(public layoutService: LayoutService) { }

    getUnreadCount(): string {
        const count = this.notificationService.unreadCount();
        return count > 0 ? count.toString() : '0';
    }

    markAsRead(id: string) {
        this.notificationService.markAsRead(id).subscribe();
    }

    markAllAsRead() {
        this.notificationService.markAllAsRead().subscribe();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
