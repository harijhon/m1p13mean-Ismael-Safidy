import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12">
                <div class="card mb-0">
                    <span class="block text-500 font-medium mb-3">Bonjour, {{ authService.currentUser()?.email }}</span>
                    <div class="text-900 font-medium text-xl">Bienvenue sur votre Dashboard</div>
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
    `
})
export class DashboardComponent {
    protected authService = inject(AuthService);
}