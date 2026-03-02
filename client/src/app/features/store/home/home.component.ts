import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { StoreService } from '../../../core/services/store.service';
import { Product } from '../../../models/product.model';
import { Store } from '../../../models/store.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private storeService = inject(StoreService);
  private route = inject(ActivatedRoute);

  // Signaux pour l'état
  products = signal<Product[]>([]);
  promotedProducts = signal<Product[]>([]);
  stores = signal<Store[]>([]);

  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');
  selectedStoreId = signal<string | null>(null);

  skeletonArray = Array(8).fill(0);

  ngOnInit(): void {
    this.loadStores();
    this.loadActiveProducts();

    // Listen to query param changes for search and store filtering
    this.route.queryParams.subscribe(params => {
      this.searchQuery.set(params['q'] || '');
      this.selectedStoreId.set(params['store'] || null);
      this.applyFilters();
    });
  }

  loadStores(): void {
    this.storeService.getStores().subscribe({
      next: (data) => {
        this.stores.set(data);
      },
      error: (err) => console.error('Erreur chargement boutiques', err)
    });
  }

  // Stocker tous les produits actifs initialement
  private allActiveProducts: Product[] = [];

  loadActiveProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.allActiveProducts = data.filter((p: Product) => p.isActive);

        // Extract promoted products
        const promoted = this.allActiveProducts.filter(p => p.sale?.isActive);
        this.promotedProducts.set(promoted);

        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des produits', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allActiveProducts];
    const query = this.searchQuery().toLowerCase();
    const storeId = this.selectedStoreId();

    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.store && p.store.name && p.store.name.toLowerCase().includes(query))
      );
    }

    if (storeId) {
      filtered = filtered.filter(p => p.store && p.store._id === storeId);
    }

    this.products.set(filtered);
  }
}