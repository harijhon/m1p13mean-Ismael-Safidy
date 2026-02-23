import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Hero Banner -->
      <section class="mb-8 rounded-xl overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-red-500 to-orange-500 h-48 flex items-center justify-center">
          <div class="text-center text-white">
            <h1 class="text-3xl font-bold mb-2">Collection Printemps</h1>
            <p class="text-lg">Jusqu'à 50% de réduction sur les nouveautés</p>
            <button class="mt-4 bg-white text-red-500 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition">
              Découvrir
            </button>
          </div>
        </div>
      </section>

      <!-- Product Grid -->
      <section>
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Produits Populaires</h2>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          @for (product of products; track product._id) {
            <a 
              [routerLink]="['/store/product', product._id]" 
              class="bg-white rounded-lg shadow-xs overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1 block"
            >
              <!-- Product Image -->
              <div class="aspect-[3/4] bg-gray-100 flex items-center justify-center relative">
                @if (product.sale?.isActive) {
                  <span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{{ product.sale!.discountPercent }}%
                  </span>
                }
                <img 
                  [src]="product.images && product.images.length > 0 ? product.images[0] : 'https://primefaces.org/cdn/primeng/images/demo/product-placeholder.svg'" 
                  [alt]="product.name"
                  class="w-full h-full object-cover"
                />
              </div>
              
              <!-- Product Info -->
              <div class="p-3">
                <h3 class="font-medium text-gray-800 truncate">{{ product.name }}</h3>
                
                <!-- Pricing -->
                @if (product.hasVariants) {
                  <div class="mt-1">
                    @if (product.sale?.isActive) {
                      <span class="text-gray-400 line-through text-sm mr-2">{{ getMinVariantPrice(product) | currency:'EUR':'symbol':'1.0-0' }}</span>
                      <span class="text-red-500 font-bold">Dès {{ product.sale!.salePrice | currency:'EUR':'symbol':'1.0-0' }}</span>
                    } @else {
                      <span class="font-bold">Dès {{ getMinVariantPrice(product) | currency:'EUR':'symbol':'1.0-0' }}</span>
                    }
                    <span class="ml-2 inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">Options</span>
                  </div>
                } @else {
                  <div class="mt-1 flex items-center gap-2">
                    @if (product.sale?.isActive) {
                      <span class="text-gray-400 line-through text-sm">{{ product.price | currency:'EUR':'symbol':'1.0-0' }}</span>
                      <span class="text-red-500 font-bold text-lg">{{ product.sale!.salePrice | currency:'EUR':'symbol':'1.0-0' }}</span>
                    } @else {
                      <span class="font-bold text-gray-900">{{ product.price | currency:'EUR':'symbol':'1.0-0' }}</span>
                    }
                  </div>
                }
              </div>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #fafafa;
    }
    
    .shadow-xs {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class HomeComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        // Filtrer les produits actifs
        this.products = data.filter(product => product.isActive);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }

  getMinVariantPrice(product: Product): number {
    if (!product.variants || product.variants.length === 0) {
      return product.price;
    }
    return Math.min(...product.variants.map(v => v.price));
  }
}