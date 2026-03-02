import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-admin-stats-widget',
    imports: [CommonModule],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Box Libres</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.boxes?.free || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-teal-100 dark:bg-teal-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-teal-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ stats.boxes?.occupied || 0 }} </span>
                <span class="text-muted-color">box occupés sur {{ stats.boxes?.total || 0 }}</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Magasins Validés</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.stores?.validated || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-indigo-100 dark:bg-indigo-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shop text-indigo-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ stats.stores?.pending || 0 }} </span>
                <span class="text-muted-color">magasins en attente</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Loyer (Cem mois)</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.rent?.collectedThisMonth || 0 | currency:'MGA':'Ar ':'1.0-0' }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-money-bill text-green-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Sur {{ stats.rent?.expectedThisMonth || 0 | currency:'MGA':'Ar ':'1.0-0' }} </span>
                <span class="text-muted-color">attendus</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Factures en Retard</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.rent?.lateInvoices || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-exclamation-triangle text-red-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">À régulariser</span>
            </div>
        </div>
    `
})
export class AdminStatsWidget implements OnInit, OnDestroy {
    stats: any = {};
    isLoading = true;

    private refreshSubscription!: Subscription;

    constructor(private dashboardService: DashboardService) { }

    ngOnInit() {
        this.loadStats();
        this.refreshSubscription = this.dashboardService.refresh$.subscribe(() => this.loadStats());
    }

    ngOnDestroy() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    private loadStats(): void {
        this.isLoading = true;
        this.dashboardService.getAdminStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading admin stats:', error);
                this.isLoading = false;
            }
        });
    }
}
