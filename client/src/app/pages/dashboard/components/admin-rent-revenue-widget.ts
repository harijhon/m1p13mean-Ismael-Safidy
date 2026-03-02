import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-admin-rent-revenue-widget',
    imports: [ChartModule],
    template: `
        <div class="card mb-8!">
            <div class="font-semibold text-xl mb-4">Revenus Locatifs</div>
            <p-chart type="line" [data]="chartData" [options]="chartOptions" class="h-100" />
        </div>`
})
export class AdminRentRevenueWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;

    subscription!: Subscription;
    private refreshSubscription!: Subscription;
    private dashboardService = inject(DashboardService);

    constructor(public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
        this.refreshSubscription = this.dashboardService.refresh$.subscribe(() => {
            this.initChart();
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            labels: ['T1', 'T2', 'T3', 'T4'],
            datasets: [
                {
                    type: 'line',
                    label: 'Revenus',
                    borderColor: documentStyle.getPropertyValue('--p-green-500'),
                    backgroundColor: documentStyle.getPropertyValue('--p-green-500'),
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    data: [0, 0, 0, 0]
                }
            ]
        };

        this.dashboardService.getAdminStats().subscribe({
            next: (data) => {
                if (data.rentChartData && Array.isArray(data.rentChartData)) {
                    this.chartData = {
                        ...this.chartData,
                        datasets: [
                            {
                                type: 'line',
                                label: 'Revenus',
                                borderColor: documentStyle.getPropertyValue('--p-green-500'),
                                backgroundColor: documentStyle.getPropertyValue('--p-green-500'),
                                borderWidth: 3,
                                fill: false,
                                tension: 0.4,
                                pointBackgroundColor: documentStyle.getPropertyValue('--p-green-500'),
                                pointBorderColor: documentStyle.getPropertyValue('--p-surface-0'),
                                pointHoverBackgroundColor: documentStyle.getPropertyValue('--p-green-600'),
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                data: data.rentChartData
                            }
                        ]
                    };
                }
            },
            error: (err) => console.error('Error fetching admin rent chart data:', err)
        });

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }
}
