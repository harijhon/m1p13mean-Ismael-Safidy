import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { StoreService } from '../../../core/services/store.service';
import { Product } from '../../../models/product.model';
import { Store } from '../../../models/store.model';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <header class="w-full bg-white border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- GAUCHE (Logo) -->
          <a routerLink="/store" class="text-2xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors">
            ShopEasy
          </a>
          
          <!-- CENTRE (Recherche) -->
          <div class="flex-1 max-w-2xl mx-4 sm:mx-8 relative">
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchInput($event)"
                (keydown.enter)="onSearch()"
                (focus)="showDropdown = true"
                (blur)="hideDropdown()"
                placeholder="Rechercher des produits ou boutiques..." 
                class="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
              <button class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none" (click)="onSearch()">
                <i class="pi pi-search"></i>
              </button>
            </div>

            <!-- Autocomplete Dropdown -->
            @if (showDropdown && (filteredProducts.length > 0 || filteredStores.length > 0)) {
              <div class="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-50 animate-fadein">
                
                @if (filteredStores.length > 0) {
                  <div class="p-3 bg-neutral-50/50">
                    <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-2">Boutiques</h3>
                    <ul class="space-y-1">
                      @for (store of filteredStores.slice(0, 3); track store._id) {
                        <li>
                          <a (mousedown)="goToStore(store._id!)" class="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-colors cursor-pointer border border-transparent hover:border-neutral-100 hover:shadow-sm">
                            <div class="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              @if (store.logo) {
                                <img [src]="store.logo" [alt]="store.name" class="w-full h-full object-cover">
                              } @else {
                                <i class="pi pi-building text-neutral-400 text-sm"></i>
                              }
                            </div>
                            <span class="font-medium text-sm text-neutral-700">{{ store.name }}</span>
                          </a>
                        </li>
                      }
                    </ul>
                  </div>
                }

                @if (filteredProducts.length > 0) {
                  <div class="p-3 border-t border-neutral-100">
                    <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 px-2">Produits</h3>
                    <ul class="space-y-1">
                      @for (product of filteredProducts.slice(0, 5); track product._id) {
                        <li>
                          <a (mousedown)="goToProduct(product._id!)" class="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer">
                            <div class="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                              @if (product.images && product.images.length > 0) {
                                <img [src]="product.images[0]" [alt]="product.name" class="w-full h-full object-cover">
                              } @else {
                                <div class="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400"><i class="pi pi-image text-xs"></i></div>
                              }
                            </div>
                            <div class="flex flex-col overflow-hidden">
                              <span class="font-medium text-sm text-neutral-800 truncate">{{ product.name }}</span>
                              <span class="text-xs text-teal-600 font-bold">{{ product.price | currency:'MGA':'Ar ':'1.0-0' }}</span>
                            </div>
                          </a>
                        </li>
                      }
                    </ul>
                  </div>
                }
                
                <div class="p-2 border-t border-neutral-100 bg-neutral-50 text-center">
                  <a (mousedown)="onSearch()" class="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer block p-2">Voir tous les résultats</a>
                </div>
              </div>
            }
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
      position: sticky;
      top: 0;
      z-index: 50;
    }
  `]
})
export class StoreHeaderComponent implements OnInit, OnDestroy {
  protected cartService = inject(CartService);
  protected authService = inject(AuthService);
  private productService = inject(ProductService);
  private storeService = inject(StoreService);
  private router = inject(Router);

  searchQuery: string = '';
  showDropdown: boolean = false;

  private allProducts: Product[] = [];
  private allStores: Store[] = [];

  filteredProducts: Product[] = [];
  filteredStores: Store[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Précharger les données pour une recherche rapide côté client (si petit volume)
    this.productService.getProducts().pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.allProducts = products.filter(p => p.isActive);
    });

    this.storeService.getStores().pipe(takeUntil(this.destroy$)).subscribe(stores => {
      this.allStores = stores;
    });

    // Configurer l'autocomplétion textuelle
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performLocalSearch(query);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string) {
    this.searchSubject.next(value);
  }

  hideDropdown() {
    // setTimeout pour laisser le temps au clic sur un lien du dropdown d'être enregistré
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }

  private performLocalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      this.filteredProducts = [];
      this.filteredStores = [];
      this.showDropdown = false;
      return;
    }

    const lowerQuery = query.toLowerCase().trim();

    this.filteredStores = this.allStores.filter(s =>
      s.name.toLowerCase().includes(lowerQuery)
    );

    this.filteredProducts = this.allProducts.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      (p.store && p.store.name && p.store.name.toLowerCase().includes(lowerQuery))
    );

    this.showDropdown = true;
  }

  goToStore(storeId: string) {
    this.showDropdown = false;
    this.router.navigate(['/store/shop', storeId]);
  }

  goToProduct(productId: string) {
    this.showDropdown = false;
    this.searchQuery = ''; // optionnel: clear search query
    this.router.navigate(['/store/product', productId]);
  }

  onSearch() {
    this.showDropdown = false;
    if (this.searchQuery !== undefined && this.searchQuery !== null) {
      this.router.navigate(['/store/search'], {
        queryParams: { q: this.searchQuery.trim() }
      });
    }
  }

  goToCart() {
    this.router.navigate(['/store/cart']);
  }
}
