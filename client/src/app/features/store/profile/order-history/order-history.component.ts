import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreOrderService } from '../../../../core/services/store-order.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, TagModule, ButtonModule, SkeletonModule],
  template: `
    <div class="order-history-page bg-surface-50 dark:bg-surface-900 p-4 lg:p-8 min-h-screen">
      <div class="max-w-4xl mx-auto">
        <header class="flex items-center mb-8 bg-white dark:bg-surface-800 p-4 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700">
          <a routerLink="/profile" class="text-surface-600 dark:text-surface-300 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
            <i class="pi pi-arrow-left text-xl"></i>
          </a>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mx-auto">Historique de mes Achats</h1>
        </header>

      @if (isLoading()) {
        <!-- Skeleton Loader -->
        <div class="space-y-4">
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-white p-4 rounded-lg shadow-sm">
              <div class="flex justify-between items-center mb-3">
                <p-skeleton width="8rem" height="1.25rem"></p-skeleton>
                <p-skeleton width="5rem" height="1.5rem"></p-skeleton>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <p-skeleton size="4rem"></p-skeleton>
                <p-skeleton size="4rem"></p-skeleton>
              </div>
              <div class="flex justify-between items-center">
                <p-skeleton width="6rem" height="1.5rem"></p-skeleton>
                <p-skeleton width="6rem" height="2.5rem"></p-skeleton>
              </div>
            </div>
          }
        </div>
      } @else if (orders().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-20 px-4 bg-white dark:bg-surface-800 rounded-3xl shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-900 mb-6">
            <i class="pi pi-shopping-bag text-5xl text-primary-500"></i>
          </div>
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">Aucune commande pour le moment</h2>
          <p class="text-surface-500 dark:text-surface-400 max-w-md mx-auto mb-8">Découvrez nos dernières collections et trouvez votre bonheur parmi notre large sélection d'articles.</p>
          <a routerLink="/store" pButton icon="pi pi-compass" label="Explorer la boutique" class="p-button-rounded p-button-lg shadow-md hover:shadow-lg transition-all"></a>
        </div>
      } @else {
        <!-- Orders List -->
        <div class="space-y-6">
          @for (order of orders(); track order._id) {
            <div class="bg-white dark:bg-surface-800 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-surface-200 dark:border-surface-700 group">
              <!-- Order Header -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <div class="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">Commande effectuée le</div>
                  <div class="text-lg font-bold text-surface-900 dark:text-surface-0">{{ order.createdAt | date: 'dd MMMM yyyy' : '' : 'fr-FR' }}</div>
                  <div class="text-xs text-surface-400 dark:text-surface-500 mt-1">Réf: #{{ order._id.substring(0, 8).toUpperCase() }}</div>
                </div>
                <p-tag [value]="getTranslatedStatus(order.status)" [severity]="getStatusSeverity(order.status)" [rounded]="true" styleClass="px-4 py-2 font-semibold text-sm shadow-sm"></p-tag>
              </div>

              <!-- Order Items Preview (Cascading Image Stack) -->
              <div class="flex items-center gap-4 mb-6 py-6 border-y border-surface-100 dark:border-surface-700">
                <div class="flex items-center -space-x-4 shrink-0">
                  @for (item of order.items.slice(0, 3); track item._id; let idx = $index) {
                    <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white dark:border-surface-800 shadow-md transform transition-transform group-hover:-translate-y-2" [style.z-index]="10 - idx" [style.transition-delay]="(idx * 50) + 'ms'">
                      <img [src]="item.product.images[0] || 'https://www.primefaces.org/cdn/primeng/images/demo/product-placeholder.svg'" class="w-full h-full object-cover">
                    </div>
                  }
                  @if (order.items.length > 3) {
                    <div class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-surface-800 shadow-md bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 font-bold z-0">
                      +{{ order.items.length - 3 }}
                    </div>
                  }
                </div>
                
                <div class="flex flex-col justify-center">
                   <span class="text-surface-700 dark:text-surface-200 font-medium">Contient {{ order.items.length }} article{{ order.items.length > 1 ? 's' : '' }}</span>
                   <span class="text-sm text-surface-500 dark:text-surface-400 line-clamp-1">
                      {{ order.items[0]?.product?.name || 'Produit inconnu' }} {{ order.items.length > 1 ? 'et autres...' : '' }}
                   </span>
                </div>
              </div>

              <!-- Order Footer -->
              <div class="flex justify-between items-end mt-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">Montant total</span>
                  <span class="text-2xl font-black text-primary-600 dark:text-primary-400">{{ order.totalAmount | currency: 'MGA':'Ar ':'1.0-0' }}</span>
                </div>
                <button pButton icon="pi pi-eye" label="Détails" class="p-button-rounded p-button-outlined p-button-secondary hover:text-primary-600"></button>
              </div>
            </div>
          }
        </div>
      }
      </div>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  private storeOrderService = inject(StoreOrderService);

  orders = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.storeOrderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch orders', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  }

  getTranslatedStatus(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Terminée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }
}
