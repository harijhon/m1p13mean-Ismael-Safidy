import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-16 flex items-center px-4">
      <div class="flex items-center flex-1">
        <!-- Logo -->
        <div class="text-xl font-bold text-gray-800 mr-6">
          ShopEasy
        </div>
        
        <!-- Barre de recherche -->
        <div class="flex-grow max-w-md">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Rechercher des produits..." 
              class="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span class="absolute right-3 top-2.5 text-gray-400">
              <i class="pi pi-search"></i>
            </span>
          </div>
        </div>
      </div>
      
      <!-- Bouton Panier -->
      <div class="relative ml-4">
        <button 
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          (click)="goToCart()"
        >
          <i class="pi pi-shopping-cart text-xl text-gray-700"></i>
          @if (cartService.count() > 0) {
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartService.count() }}
            </span>
          }
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class StoreHeaderComponent {
  protected cartService = inject(CartService);
  private router = inject(Router);

  goToCart() {
    this.router.navigate(['/store/cart']);
  }
}