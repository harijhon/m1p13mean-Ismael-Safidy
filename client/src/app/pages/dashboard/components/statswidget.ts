import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Orders</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.orders || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ newOrders }} new </span>
                <span class="text-muted-color">since last visit</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Revenue</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.revenue | currency:'USD':'symbol':'1.0-0' }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ revenueGrowth }}%+ </span>
                <span class="text-muted-color">since last week</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Customers</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.customers || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ newCustomers }} </span>
                <span class="text-muted-color">newly registered</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Products</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.products || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-box text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ activeProducts }} </span>
                <span class="text-muted-color">active products</span>
            </div>
        </div>`
})
export class StatsWidget implements OnInit {
    stats: any = {};
    isLoading = true;
    newOrders = 24;
    revenueGrowth = 52;
    newCustomers = 520;
    activeProducts = 85;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.isLoading = false;
                // Calculate derived values if needed
                this.newOrders = Math.floor(data.orders * 0.15); // Example calculation
                this.newCustomers = Math.floor(data.customers * 0.02); // Example calculation
                this.activeProducts = Math.floor(data.products * 0.85); // Example calculation
            },
            error: (error) => {
                console.error('Error loading dashboard stats:', error);
                this.isLoading = false;
            }
        });
    }
}
