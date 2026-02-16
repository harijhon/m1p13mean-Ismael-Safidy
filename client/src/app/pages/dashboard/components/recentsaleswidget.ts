import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Recent Sales</div>
        <p-table [value]="recentSales" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-sale>
                <tr>
                    <td style="width: 25%; min-width: 7rem;">{{ sale.customer?.name || 'Guest' }}</td>
                    <td style="width: 25%; min-width: 7rem;">{{ sale.createdAt | date:'short' }}</td>
                    <td style="width: 25%; min-width: 8rem;">{{ sale.totalAmount | currency:'USD':'symbol':'1.0-0' }}</td>
                    <td style="width: 25%;">
                        <span class="font-medium" [class.text-green-500]="sale.status === 'COMPLETED'" 
                              [class.text-yellow-500]="sale.status === 'PENDING'"
                              [class.text-red-500]="sale.status === 'CANCELLED' || sale.status === 'REFUNDED'">
                            {{ sale.status }}
                        </span>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`
})
export class RecentSalesWidget implements OnInit {
    recentSales: any[] = [];
    isLoading = true;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.recentSales = data.recentSales || [];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading recent sales:', error);
                this.isLoading = false;
            }
        });
    }
}
