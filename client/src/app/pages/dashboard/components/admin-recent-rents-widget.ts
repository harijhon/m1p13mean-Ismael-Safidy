import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-admin-recent-rents-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: `
        <div class="card mb-8!">
            <div class="font-semibold text-xl mb-4">Loyers récents</div>
            <p-table [value]="recentRents" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th>Magasin</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Statut</th>
                    </tr>
                </ng-template>
                <ng-template #body let-rent>
                    <tr>
                        <td style="width: 25%; min-width: 7rem;">{{ rent.store?.name || 'Inconnu' }}</td>
                        <td style="width: 25%; min-width: 7rem;">{{ rent.updatedAt | date:'short' }}</td>
                        <td style="width: 25%; min-width: 8rem;">{{ rent.amountPaid | currency:'MGA':'Ar ':'1.0-0' }}</td>
                        <td style="width: 25%;">
                            <span class="font-medium" [class.text-green-500]="rent.status === 'PAID'" 
                                  [class.text-yellow-500]="rent.status === 'PARTIAL' || rent.status === 'PENDING'"
                                  [class.text-red-500]="rent.status === 'LATE'">
                                {{ rent.status }}
                            </span>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>`
})
export class AdminRecentRentsWidget implements OnInit, OnDestroy {
    recentRents: any[] = [];
    private refreshSubscription!: Subscription;

    constructor(private dashboardService: DashboardService) { }

    ngOnInit() {
        this.loadRents();
        this.refreshSubscription = this.dashboardService.refresh$.subscribe(() => {
            this.loadRents();
        });
    }

    ngOnDestroy() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    private loadRents() {
        this.dashboardService.getAdminStats().subscribe({
            next: (data) => {
                this.recentRents = data.recentRents || [];
            },
            error: (error) => console.error('Error loading recent rents', error)
        });
    }
}
