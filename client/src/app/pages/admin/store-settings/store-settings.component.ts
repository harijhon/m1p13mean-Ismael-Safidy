import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { StoreService } from '../../../core/services/store.service';
import { ProductService } from '../../../core/services/product.service';
import { DashboardService } from '../../../core/services/dashboard.service'; // Import DashboardService
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart'; // Import ChartModule
import { Product } from '../../../models/product.model';
import { Store } from '../../../models/store.model';

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    CardModule,
    TabsModule,
    AvatarModule,
    BadgeModule,
    TableModule,
    TagModule,
    ChartModule // Add ChartModule
  ],
  providers: [MessageService],
  templateUrl: 'store-settings.component.html',
  styleUrls: ['./store-settings.component.scss']
})
export class StoreSettingsComponent implements OnInit {
  private storeService = inject(StoreService);
  private productService = inject(ProductService);
  private dashboardService = inject(DashboardService); // Inject
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  storeForm!: FormGroup;
  isSubmitting = false;
  isDialogVisible = signal(false);

  // Data Signals
  stores = signal<Store[]>([]);
  activeStoreIndex = signal<number>(0);
  store = signal<Store | null>(null);
  productCount = signal<number>(0);
  products = signal<Product[]>([]);

  // Stats & Dashboard Data
  orderCount = signal<number>(0);
  revenue = signal<number>(0);
  recentSales = signal<any[]>([]); // For History Table

  // Charts
  chartData: any;
  chartOptions: any;

  constructor() {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      logo: [''],
      description: ['']
    });
    this.initChart();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // 1. Load Stores
    this.storeService.getMyStores().subscribe({
      next: (stores) => {
        this.stores.set(stores);

        if (stores.length > 0) {
          this.selectStore(stores[0]);
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de charger les magasins."
        });
      }
    });
  }

  selectStore(store: Store): void {
    this.store.set(store);
    // Patch form
    this.storeForm.patchValue({
      name: store.name,
      logo: store.logo,
      description: store.description
    });
    // Load products for this store
    this.loadProducts(store._id);
    // Load stats for this store
    this.loadStoreStats(store._id);
  }

  onStoreTabChange(event: any): void {
    const index = event.index;
    // Last tab might be "Add Store" if we implement that
    if (index < this.stores().length) {
      this.selectStore(this.stores()[index]);
    }
  }

  loadStoreStats(storeId: string | undefined): void {
    if (!storeId) return;

    this.dashboardService.getStats(storeId).subscribe({
      next: (stats) => {
        this.revenue.set(stats.revenue);
        this.orderCount.set(stats.orders);
        this.productCount.set(stats.products); // Update product count from stats (faster)
        this.recentSales.set(stats.recentSales);

        // Update Chart with Top Products data
        this.updateChartData(stats.topProducts);
      },
      error: (err) => console.error('Failed to load store stats', err)
    });
  }

  loadProducts(storeId: string | undefined): void {
    if (!storeId) return;

    this.productService.getProducts().subscribe({
      next: (products) => {
        const storeProducts = products.filter(p => {
          const pStoreId = (typeof p.store === 'object' && p.store !== null) ? (p.store as any)._id : p.store;
          return pStoreId === storeId;
        });

        this.products.set(storeProducts);
        // this.productCount.set(storeProducts.length); // Use stats count instead
      },
      error: (err) => console.error('Failed to load products count', err)
    });
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
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
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  updateChartData(topProducts: any[]) {
    const documentStyle = getComputedStyle(document.documentElement);

    this.chartData = {
      labels: topProducts.map(p => p.productDetails?.[0]?.name || 'Produit Inconnu'),
      datasets: [
        {
          label: 'Ventes (Quantité)',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          data: topProducts.map(p => p.totalQuantity)
        }
      ]
    };
  }

  getSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warn';
      case 'CANCELLED': return 'danger';
      case 'REFUNDED': return 'danger';
      default: return 'info';
    }
  }

  openDialog(): void {
    // Ensure form is populated with the latest data before opening
    if (this.store()) {
      this.storeForm.patchValue(this.store()!);
    }
    this.isDialogVisible.set(true);
  }

  hideDialog(): void {
    this.isDialogVisible.set(false);
  }

  openCreateStoreDialog(): void {
    this.store.set(null); // Clear selected store
    this.storeForm.reset();
    this.isDialogVisible.set(true);
  }

  onSubmit(): void {
    if (this.storeForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    const formValue = this.storeForm.value;

    if (this.store()) {
      // Update existing store
      // We use updateStore with ID because 'updateMyStore' at backend might ambiguity with multiple stores
      // But StoreService.updateStore requires admin? Let's check permissions.
      // If updateStore is admin only, we might need to fix backend permissions or use updateMyStore with ID in body.
      // For now, let's assume we can use updateStore or I'll use a modified update call.
      // Actually, looking at store.service.ts, updateStore takes a Store object which has _id.
      const updatedStoreData = { ...this.store(), ...formValue };

      this.storeService.updateStore(updatedStoreData).subscribe({
        next: (updated) => {
          this.handleSuccess(updated, 'Magasin mis à jour');
        },
        error: (err) => this.handleError(err)
      });
    } else {
      // Create new store
      this.storeService.createStore(formValue as Store).subscribe({
        next: (newStore) => {
          // Add to list
          this.stores.update(list => [...list, newStore]);
          this.selectStore(newStore); // Select it
          this.handleSuccess(newStore, 'Magasin créé avec succès');
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(store: Store, msg: string): void {
    this.isSubmitting = false;
    this.store.set(store);
    this.hideDialog();
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: msg });
    // Refresh list just in case
    this.loadData();
  }

  private handleError(err: any): void {
    this.isSubmitting = false;
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Une erreur est survenue.' });
  }

  getInitials(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : 'ST';
  }
}

