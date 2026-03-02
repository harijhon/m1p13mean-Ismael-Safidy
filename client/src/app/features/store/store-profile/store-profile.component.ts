import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { StoreService } from '../../../core/services/store.service';
import { Product } from '../../../models/product.model';
import { Store } from '../../../models/store.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-store-profile',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './store-profile.component.html'
})
export class StoreProfileComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);
    private storeService = inject(StoreService);

    storeId = signal<string>('');
    storeData = signal<Store | null>(null);

    products = signal<Product[]>([]);
    promotedProducts = signal<Product[]>([]);

    isLoading = signal<boolean>(true);
    storeNotFound = signal<boolean>(false);

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.storeId.set(id);
                this.loadStoreData(id);
            } else {
                this.storeNotFound.set(true);
                this.isLoading.set(false);
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadStoreData(id: string) {
        this.isLoading.set(true);

        // Charger infos boutique
        this.storeService.getStores().subscribe({
            next: (allStores) => {
                const found = allStores.find(s => s._id === id);
                if (found) {
                    this.storeData.set(found);
                    this.loadStoreProducts(id);
                } else {
                    this.storeNotFound.set(true);
                    this.isLoading.set(false);
                }
            },
            error: () => {
                this.storeNotFound.set(true);
                this.isLoading.set(false);
            }
        });
    }

    private loadStoreProducts(id: string) {
        this.productService.getProducts(true).subscribe({
            next: (allProducts) => {
                const storeProducts = allProducts.filter(p => p.store && p.store._id === id && p.isActive !== false);
                this.products.set(storeProducts);

                const promoted = storeProducts.filter(p => p.sale?.isActive);
                this.promotedProducts.set(promoted);

                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }
}
