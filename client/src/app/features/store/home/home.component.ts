import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);

  // Utilisation des Signals pour l'état des produits
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);

  // Pour le squelette de chargement (générer 8 fausses cartes)
  skeletonArray = Array(8).fill(0);

  ngOnInit(): void {
    this.loadActiveProducts();
  }

  loadActiveProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        // Filtrer uniquement les produits actifs pour la vitrine
        const activeProducts = data.filter((p: Product) => p.isActive);
        this.products.set(activeProducts);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des produits', err);
        this.isLoading.set(false);
      }
    });
  }
}