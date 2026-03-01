import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Import RouterLink
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service'; // Import AuthService

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink to imports
  template: `
    <header class="w-full bg-white border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- GAUCHE (Logo) -->
          <a routerLink="/store" class="text-2xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors">
            ShopEasy
          </a>
          
          <!-- CENTRE (Recherche) -->
          <div class="flex-1 max-w-2xl mx-4 sm:mx-8">
            <div class="relative">
              <input 
                type="text" 
                placeholder="Rechercher des produits..." 
                class="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
              <span class="absolute right-3 top-2.5 text-gray-400">
                <i class="pi pi-search"></i>
              </span>
            </div>
          </div>
          
          <!-- DROITE (Actions) -->
          <div class="flex items-center gap-4 sm:gap-6">
            <!-- Profil -->
            @if (authService.isLoggedIn()) {
              <a 
                routerLink="/profile" 
                class="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              >
                <i class="pi pi-user text-xl"></i>
              </a>
            }

            <!-- Panier -->
            <button 
              class="p-2 rounded-full hover:bg-gray-100 transition-colors relative text-gray-700"
              (click)="goToCart()"
            >
              <i class="pi pi-shopping-cart text-xl"></i>
              @if (cartService.totalItems() > 0) {
                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {{ cartService.totalItems() }}
                </span>
              }
            </button>
          </div>

        </div>
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
  protected authService = inject(AuthService); // Inject AuthService
  private router = inject(Router);

  goToCart() {
    this.router.navigate(['/store/cart']);
  }
}