import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CreateStoreComponent } from '../admin/create-store/create-store.component'; // Import the new component

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule, 
        ButtonModule, 
        StatsWidget, 
        RecentSalesWidget, 
        BestSellingWidget, 
        RevenueStreamWidget, 
        NotificationsWidget,
        CreateStoreComponent // Add to imports
    ],
    template: `
        @if (authService.currentUser()?.storeId) {
            <!-- Main Dashboard View -->
            <div class="grid grid-cols-12 gap-8">
                <div class="col-span-12">
                    <div class="card mb-0">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="block text-500 font-medium mb-3">Bonjour, {{ authService.currentUser()?.email }}</span>
                                <div class="text-900 font-medium text-xl">Bienvenue sur votre Dashboard</div>
                            </div>
                            <div>
                                <button pButton pRipple icon="pi pi-refresh" (click)="refreshData()" class="p-button-text"></button>
                            </div>
                        </div>
                    </div>
                </div>
                <app-stats-widget class="contents" />
                <div class="col-span-12 xl:col-span-6">
                    <app-recent-sales-widget />
                    <app-best-selling-widget />
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <app-revenue-stream-widget />
                    <app-notifications-widget />
                </div>
            </div>
        } @else {
            <!-- Create Store Onboarding View -->
            <div>
                <div class="col-12">
                    <app-create-store />
                </div>
            </div>
        }
    `
})
export class DashboardComponent {
    protected authService = inject(AuthService);
    protected dashboardService = inject(DashboardService);

    refreshData(): void {
        this.dashboardService.triggerRefresh();
    }
}