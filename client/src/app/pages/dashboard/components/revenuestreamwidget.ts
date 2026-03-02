import { Component, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Flux de revenus</div>
        <p-chart type="line" [data]="chartData" [options]="chartOptions" class="h-100" />
    </div>`
})
export class RevenueStreamWidget {
    chartData: any;

    chartOptions: any;

    subscription!: Subscription;
    private dashboardService = inject(DashboardService);

    constructor(public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            labels: ['S1', 'S2', 'S3', 'S4'],
            datasets: [
                {
                    type: 'line',
                    label: 'Revenus',
                    borderColor: documentStyle.getPropertyValue('--p-primary-400'),
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    data: [0, 0, 0, 0]
                }
            ]
        };

        this.dashboardService.getStats().subscribe({
            next: (data) => {
                if (data.chartData && Array.isArray(data.chartData)) {
                    this.chartData = {
                        ...this.chartData,
                        datasets: [
                            {
                                type: 'line',
                                label: 'Revenus',
                                borderColor: documentStyle.getPropertyValue('--p-primary-400'),
                                backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                                borderWidth: 3,
                                fill: false,
                                tension: 0.4,
                                pointBackgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                                pointBorderColor: documentStyle.getPropertyValue('--p-surface-0'),
                                pointHoverBackgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                data: data.chartData
                            }
                        ]
                    };
                }
            },
            error: (err) => console.error('Error fetching chart data:', err)
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

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
