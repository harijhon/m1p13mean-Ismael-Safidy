import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule, CommonModule],
    template: `<div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Activité récente</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <span class="block text-muted-color font-medium mb-4">DERNIÈRES TRANSACTIONS</span>
        
        @if (isLoading) {
            <p class="text-surface-500">Chargement des activités...</p>
        } @else if (notifications.length === 0) {
            <p class="text-surface-500">Aucune activité récente trouvée.</p>
        } @else {
            <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                <li *ngFor="let notification of notifications; let last = last" class="flex items-center py-2" [class.border-b]="!last" [class.border-surface]="!last">
                    <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                        <i class="pi pi-dollar text-xl! text-blue-500"></i>
                    </div>
                    <span class="text-surface-900 dark:text-surface-0 leading-normal"
                        >{{ notification.customerName }}
                        <span class="text-surface-700 dark:text-surface-100">a acheté {{ notification.productName }} pour <span class="text-primary font-bold">{{ notification.amount | currency:'MGA':'Ar ':'1.0-2' }}</span></span>
                        <div class="text-surface-500 text-sm mt-1">{{ notification.date | date:'shortTime' }}</div>
                    </span>
                </li>
            </ul>
        }
    </div>`
})
export class NotificationsWidget implements OnInit, OnDestroy {
    notifications: any[] = [];
    isLoading = true;
    items = [
        { label: 'Voir tout', icon: 'pi pi-fw pi-eye' },
        { label: 'Effacer', icon: 'pi pi-fw pi-trash' }
    ];

    private refreshSubscription!: Subscription;
    private dashboardService = inject(DashboardService);

    ngOnInit() {
        this.loadNotifications();
        this.refreshSubscription = this.dashboardService.refresh$.subscribe(() => this.loadNotifications());
    }

    ngOnDestroy() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    private loadNotifications(): void {
        this.isLoading = true;
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.notifications = data.notifications || [];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading notifications:', error);
                this.isLoading = false;
            }
        });
    }
}

