import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: ` <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Best Selling Products</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>
        <ul class="list-none p-0 m-0">
            <li *ngFor="let product of topProducts; let i = index" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ product.productDetails[0]?.name || 'Product ' + (i+1) }}</span>
                    <div class="mt-1 text-muted-color">{{ product.productDetails[0]?.type || 'Type' }}</div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div class="bg-orange-500 h-full" [style.width.%]="calculatePercentage(i)"></div>
                    </div>
                    <span class="text-orange-500 ml-4 font-medium">{{ calculatePercentage(i) }}%</span>
                </div>
            </li>
        </ul>
    </div>`
})
export class BestSellingWidget implements OnInit {
    topProducts: any[] = [];
    isLoading = true;
    menu: any = null;

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.topProducts = data.topProducts || [];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading top products:', error);
                this.isLoading = false;
            }
        });
    }

    calculatePercentage(index: number): number {
        if (this.topProducts.length === 0) return 0;
        
        // Find the highest quantity sold to normalize percentages
        const maxQuantity = Math.max(...this.topProducts.map(p => p.totalQuantity), 1);
        const currentQuantity = this.topProducts[index]?.totalQuantity || 0;
        
        // Calculate percentage relative to the highest selling product
        return Math.round((currentQuantity / maxQuantity) * 100);
    }
}
