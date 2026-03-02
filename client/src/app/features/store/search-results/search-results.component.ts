import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ProductService } from '../../../core/services/product.service';
import { StoreService } from '../../../core/services/store.service';
import { Product } from '../../../models/product.model';
import { Store } from '../../../models/store.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-search-results',
    standalone: true,
    imports: [CommonModule, RouterLink, PaginatorModule],
    templateUrl: './search-results.component.html'
})
export class SearchResultsComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);
    private storeService = inject(StoreService);

    searchQuery = signal<string>('');

    stores = signal<Store[]>([]);
    products = signal<Product[]>([]);

    isLoading = signal<boolean>(true);

    // Pagination
    first = signal<number>(0);
    rows = signal<number>(10);
    totalRecords = signal<number>(0);

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const query = params['q'] || '';
            this.searchQuery.set(query);
            this.first.set(0); // Reset pagination on new search
            this.performSearch(query);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private performSearch(query: string) {
        this.isLoading.set(true);
        const lowerQuery = query.toLowerCase().trim();

        // In a real app, this should be a backend search endpoint.
        // Here we simulate it by fetching all and filtering client-side.

        this.storeService.getStores().subscribe({
            next: (allStores) => {
                const filteredStores = allStores.filter(s =>
                    lowerQuery ? s.name.toLowerCase().includes(lowerQuery) : true
                );
                this.stores.set(filteredStores);
                this.checkLoadingState('stores');
            },
            error: () => this.checkLoadingState('stores')
        });

        this.productService.getProducts(true).subscribe({
            next: (allProducts) => {
                const filteredProducts = allProducts.filter(p =>
                    p.isActive !== false && (
                        !lowerQuery ||
                        p.name.toLowerCase().includes(lowerQuery) ||
                        (p.store && p.store.name && p.store.name.toLowerCase().includes(lowerQuery))
                    )
                );

                this.totalRecords.set(filteredProducts.length);
                const startIndex = this.first();
                const endIndex = startIndex + this.rows();
                this.products.set(filteredProducts.slice(startIndex, endIndex));

                this.checkLoadingState('products');
            },
            error: () => this.checkLoadingState('products')
        });
    }

    onPageChange(event: any) {
        this.first.set(event.first);
        this.rows.set(event.rows);
        this.performSearch(this.searchQuery());
    }

    private loadingFlags = { stores: false, products: false };
    private checkLoadingState(source: 'stores' | 'products') {
        this.loadingFlags[source] = true;
        if (this.loadingFlags.stores && this.loadingFlags.products) {
            this.isLoading.set(false);
            this.loadingFlags = { stores: false, products: false }; // reset for next search
        }
    }
}
