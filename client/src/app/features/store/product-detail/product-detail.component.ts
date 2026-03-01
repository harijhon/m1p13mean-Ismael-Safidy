import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { CartToastService } from '../../../core/services/cart-toast.service';
import { Product, Variant } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private cartToastService = inject(CartToastService);

  // État du produit
  product = signal<Product | null>(null);
  isLoading = signal<boolean>(true);

  // Signaux pour l'état UI
  selectedImage = signal<string>('');
  quantity = signal<number>(1);
  activeTab = signal<'description' | 'specifications' | 'shipping'>('description');

  // État des Variantes
  selectedAttributes = signal<{ [key: string]: string }>({});

  // Computed: Trouver la variante qui matche EXACTEMENT les attributs sélectionnés
  currentVariant = computed<Variant | null>(() => {
    const prod = this.product();
    const selections = this.selectedAttributes();

    if (!prod || !prod.hasVariants || !prod.variants) return null;

    // Cherche une variante où chaque attribut correspond à la sélection
    return prod.variants.find(variant => {
      // S'il n'y a pas d'attributs sélectionnés mais que la variante a des attributs, false
      if (Object.keys(selections).length === 0 && Object.keys(variant.attributes).length > 0) return false;

      // Vérifie que chaque attribut requis par la variante matche la sélection
      for (const [key, value] of Object.entries(variant.attributes)) {
        if (selections[key] !== value) return false;
      }
      return true;
    }) || null;
  });

  // Computed: Extraire toutes les options disponibles par attribut (ex: Couleur: ['Bleu', 'Rouge'])
  availableAttributes = computed<{ name: string, values: string[] }[]>(() => {
    const prod = this.product();
    if (!prod || !prod.hasVariants || !prod.variants) return [];

    const attrMap = new Map<string, Set<string>>();

    prod.variants.forEach(variant => {
      if (variant.attributes) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!attrMap.has(key)) {
            attrMap.set(key, new Set<string>());
          }
          attrMap.get(key)!.add(value);
        });
      }
    });

    return Array.from(attrMap.entries()).map(([name, valuesSet]) => ({
      name,
      values: Array.from(valuesSet)
    }));
  });

  // Computed: Prix dynamique
  displayPrice = computed<number>(() => {
    const variant = this.currentVariant();
    if (variant) return variant.price;
    const prod = this.product();
    return prod ? prod.price : 0;
  });

  // Computed: Stock dynamique
  displayStock = computed<number>(() => {
    const variant = this.currentVariant();
    if (variant) return variant.stock;
    const prod = this.product();
    return prod ? prod.currentStock : 0;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.isLoading.set(false);
    }
  }

  loadProduct(id: string): void {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product.set(data);
        if (data.images && data.images.length > 0) {
          this.selectedImage.set(data.images[0]);
        }

        // Auto-sélectionner la première option s'il y a des variantes pour guider l'utilisateur
        if (data.hasVariants && data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          if (firstVariant.attributes) {
            this.selectedAttributes.set({ ...firstVariant.attributes });
            // Si la variante a une image spécifique, l'afficher
            if (firstVariant.image) {
              this.selectedImage.set(firstVariant.image);
            }
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur de chargement du produit:', err);
        this.isLoading.set(false);
      }
    });
  }

  changeImage(index: number | string): void {
    const prod = this.product();
    if (typeof index === 'number' && prod && prod.images) {
      this.selectedImage.set(prod.images[index]);
    } else if (typeof index === 'string') {
      this.selectedImage.set(index); // si c'est directement l'URL
    }
  }

  selectAttribute(attrName: string, value: string): void {
    this.selectedAttributes.update(current => ({
      ...current,
      [attrName]: value
    }));

    // Réinitialiser la quantité pour éviter d'acheter plus de stock que dispo sur la nouvelle variante
    this.quantity.set(1);

    // Mettre à jour l'image si la nouvelle variante en a une
    const variant = this.currentVariant();
    if (variant && variant.image) {
      this.selectedImage.set(variant.image);
    }
  }

  incrementQuantity(): void {
    const maxStock = this.displayStock();
    if (maxStock > 0 && this.quantity() < maxStock) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  setActiveTab(tab: 'description' | 'specifications' | 'shipping'): void {
    this.activeTab.set(tab);
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod) return;

    if (prod.hasVariants) {
      const variant = this.currentVariant();
      if (variant && variant.stock > 0) {
        this.cartService.addToCart(prod, variant, this.quantity());

        const imageToShow = variant.image || (prod.images && prod.images.length > 0 ? prod.images[0] : '');
        const variantName = prod.name + ' - ' + Object.values(variant.attributes).join(', ');
        this.cartToastService.showToast(variantName, imageToShow);
      } else {
        console.log('Veuillez sélectionner une variante valide en stock');
      }
    } else {
      if (prod.currentStock > 0) {
        this.cartService.addToCart(prod, undefined, this.quantity());

        const imageToShow = (prod.images && prod.images.length > 0) ? prod.images[0] : '';
        this.cartToastService.showToast(prod.name, imageToShow);
      }
    }
  }

  notifyMe(): void {
    console.log(`Notification demandée pour : ${this.product()?.name}`);
  }

  isAddToCartDisabled(): boolean {
    const prod = this.product();
    if (!prod) return true;

    if (prod.hasVariants) {
      const variant = this.currentVariant();
      // Désactivé si la variante n'est pas complètement sélectionnée ou si son stock est 0
      return !variant || variant.stock === 0;
    }
    // Pour produit simple, désactivé si stock 0
    return prod.currentStock === 0;
  }
}