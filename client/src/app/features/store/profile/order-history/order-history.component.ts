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
    <div class="order-history-page bg-gray-50 p-4 min-h-screen">
      <header class="flex items-center mb-6">
        <a routerLink="/profile" class="text-gray-600"><i class="pi pi-arrow-left"></i></a>
        <h1 class="text-xl font-bold text-gray-800 mx-auto">Mes Commandes</h1>
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
        <div class="text-center py-12">
          <img src="https://www.svgrepo.com/show/493506/order-declined.svg" alt="No orders" class="mx-auto h-32 opacity-50">
          <p class="mt-4 text-gray-500">Vous n'avez pas encore de commandes.</p>
          <a routerLink="/store" pButton class="mt-6">Commencer mes achats</a>
        </div>
      } @else {
        <!-- Orders List -->
        <div class="space-y-4">
          @for (order of orders(); track order._id) {
            <div class="bg-white p-4 rounded-lg shadow-sm">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-gray-500">{{ order.createdAt | date: 'dd/MM/yyyy' }}</span>
                <p-tag [value]="order.status" [severity]="getStatusSeverity(order.status)"></p-tag>
              </div>
              <div class="flex items-center gap-2 mb-3 border-b pb-3">
                @for (item of order.items.slice(0, 2); track item._id) {
                  <img [src]="item.product.images[0] || 'https://www.primefaces.org/cdn/primeng/images/demo/product-placeholder.svg'" class="w-16 h-16 object-cover rounded-md">
                }
                @if (order.items.length > 2) {
                  <span class="text-sm text-gray-500 self-center">+ {{ order.items.length - 2 }} autres</span>
                }
              </div>
              <div class="flex justify-between items-center">
                <span class="font-bold text-gray-800">{{ order.totalAmount | currency: 'EUR' }}</span>
                <button pButton label="Détails" class="p-button-sm p-button-outlined"></button>
              </div>
            </div>
          }
        </div>
      }
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
}
