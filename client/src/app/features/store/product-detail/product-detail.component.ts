import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, Variant } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Galerie d'images -->
        <div class="space-y-4">
          <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative">
            @if (product()?.sale?.isActive) {
              <div class="absolute top-4 left-4 flex flex-col gap-2">
                <span class="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                  Offre Limitée -{{ product()?.sale?.discountPercent }}%
                </span>
              </div>
            }
            <img 
              [src]="selectedImage()" 
              [alt]="product()?.name"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="grid grid-cols-4 gap-2">
            @for (image of product()?.images; track $index) {
              <div 
                class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2"
                [class.border-red-500]="selectedImage() === image"
                (click)="selectImage(image)"
              >
                <img 
                  [src]="image" 
                  [alt]="'Image ' + ($index + 1)"
                  class="w-full h-full object-cover"
                />
              </div>
            }
          </div>
        </div>

        <!-- Détails du produit -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product()?.name }}</h1>
          
          <!-- Prix -->
          <div class="mb-4">
            @if (currentVariant()) {
              @if (product()?.sale?.isActive) {
                <span class="text-3xl font-bold text-red-500">{{ product()?.sale?.salePrice | currency:'EUR':'symbol':'1.0-0' }}</span>
                <span class="text-gray-400 line-through text-lg ml-3">{{ currentVariant()?.price | currency:'EUR':'symbol':'1.0-0' }}</span>
              } @else {
                <span class="text-3xl font-bold text-gray-900">{{ currentVariant()?.price | currency:'EUR':'symbol':'1.0-0' }}</span>
              }
            } @else {
              @if (product()?.hasVariants) {
                @if (product()?.sale?.isActive) {
                  <span class="text-3xl font-bold text-red-500">Dès {{ product()?.sale?.salePrice | currency:'EUR':'symbol':'1.0-0' }}</span>
                  <span class="text-gray-400 line-through text-lg ml-3">{{ minPrice() | currency:'EUR':'symbol':'1.0-0' }}</span>
                } @else {
                  <span class="text-3xl font-bold text-gray-900">Dès {{ minPrice() | currency:'EUR':'symbol':'1.0-0' }} à {{ maxPrice() | currency:'EUR':'symbol':'1.0-0' }}</span>
                }
              } @else {
                @if (product()?.sale?.isActive) {
                  <span class="text-3xl font-bold text-red-500">{{ product()?.sale?.salePrice | currency:'EUR':'symbol':'1.0-0' }}</span>
                  <span class="text-gray-400 line-through text-lg ml-3">{{ product()?.price | currency:'EUR':'symbol':'1.0-0' }}</span>
                } @else {
                  <span class="text-3xl font-bold text-gray-900">{{ product()?.price | currency:'EUR':'symbol':'1.0-0' }}</span>
                }
              }
            }
          </div>

          <!-- Description -->
          <p class="text-gray-600 mb-6">Description du produit...</p>

          <!-- Sélection des variantes -->
          @if (product()?.hasVariants) {
            <!-- Sélection de la couleur -->
            @if (availableColors().length > 0) {
              <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Couleur</h3>
                <div class="flex flex-wrap gap-2">
                  @for (color of availableColors(); track color) {
                    <button
                      type="button"
                      class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border"
                      [class.bg-black]="selectedAttributes().get('color') === color"
                      [class.text-white]="selectedAttributes().get('color') === color"
                      [class.border-black]="selectedAttributes().get('color') === color"
                      [class.bg-white]="selectedAttributes().get('color') !== color"
                      [class.text-gray-900]="selectedAttributes().get('color') !== color"
                      [class.border-gray-300]="selectedAttributes().get('color') !== color"
                      [class.opacity-50]="!isAttributeAvailable('color', color)"
                      [class.cursor-not-allowed]="!isAttributeAvailable('color', color)"
                      [disabled]="!isAttributeAvailable('color', color)"
                      (click)="selectAttribute('color', color)"
                    >
                      {{ color }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Sélection de la taille -->
            @if (availableSizes().length > 0) {
              <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Taille</h3>
                <div class="flex flex-wrap gap-2">
                  @for (size of availableSizes(); track size) {
                    <button
                      type="button"
                      class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border"
                      [class.bg-black]="selectedAttributes().get('size') === size"
                      [class.text-white]="selectedAttributes().get('size') === size"
                      [class.border-black]="selectedAttributes().get('size') === size"
                      [class.bg-white]="selectedAttributes().get('size') !== size"
                      [class.text-gray-900]="selectedAttributes().get('size') !== size"
                      [class.border-gray-300]="selectedAttributes().get('size') !== size"
                      [class.opacity-50]="!isAttributeAvailable('size', size)"
                      [class.cursor-not-allowed]="!isAttributeAvailable('size', size)"
                      [disabled]="!isAttributeAvailable('size', size)"
                      (click)="selectAttribute('size', size)"
                    >
                      {{ size }}
                    </button>
                  }
                </div>
              </div>
            }
          }

          <!-- Sélection de la quantité -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Quantité</h3>
            <div class="flex items-center gap-4">
              <button 
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                (click)="decreaseQuantity()"
                [disabled]="quantity() <= 1"
              >
                -
              </button>
              <span class="text-xl font-medium w-10 text-center">{{ quantity() }}</span>
              <button 
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                (click)="increaseQuantity()"
              >
                +
              </button>
            </div>
          </div>

          <!-- Informations sur la disponibilité -->
          @if (currentVariant()) {
            <div class="mb-4">
              <p class="text-green-600 font-medium">
                @if (currentVariant(); as variant) {
                  @if (variant.stock !== undefined && variant.stock > 0) {
                    En stock ({{ variant.stock }} restants)
                  } @else {
                    Rupture de stock
                  }
                }
              </p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Bouton Ajouter au Panier (Sticky sur mobile) -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden">
      <button
        class="w-full bg-black text-white py-4 px-6 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        [disabled]="!currentVariant() || (currentVariant()?.stock && currentVariant()?.stock === 0)"
        (click)="addToCart()"
      >
        @if (!currentVariant() || (currentVariant()?.stock && currentVariant()?.stock === 0)) {
          <span>Indisponible</span>
        } @else {
          <span>Ajouter au panier - {{ (product()?.sale?.isActive ? product()?.sale?.salePrice : currentVariant()?.price) | currency:'EUR':'symbol':'1.0-0' }}</span>
        }
      </button>
    </div>

    <!-- Bouton Ajouter au Panier (Desktop) -->
    <div class="hidden lg:block mt-8 text-center">
      <button
        class="w-full max-w-md mx-auto bg-black text-white py-4 px-6 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        [disabled]="!currentVariant() || (currentVariant()?.stock && currentVariant()?.stock === 0)"
        (click)="addToCart()"
      >
        @if (!currentVariant() || (currentVariant()?.stock && currentVariant()?.stock === 0)) {
          <span>Indisponible</span>
        } @else {
          <span>Ajouter au panier - {{ (product()?.sale?.isActive ? product()?.sale?.salePrice : currentVariant()?.price) | currency:'EUR':'symbol':'1.0-0' }}</span>
        }
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding-bottom: 80px; /* Pour compenser le bouton sticky sur mobile */
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  // Injection des services
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // Données du produit
  productId = signal<string | null>(null);
  product = signal<Product | null>(null);
  selectedImage = signal<string>('');

  // Sélections
  selectedAttributes = signal<Map<string, string>>(new Map());
  quantity = signal<number>(1);

  // Propriétés calculées
  availableColors = computed(() => {
    if (!this.product()?.hasVariants || !this.product()?.variants) return [];
    const colors = new Set<string>();
    this.product()?.variants?.forEach(variant => {
      const color = variant.attributes['Couleur'] || variant.attributes['Color'];
      if (color) colors.add(color);
    });
    return Array.from(colors);
  });

  availableSizes = computed(() => {
    if (!this.product()?.hasVariants || !this.product()?.variants) return [];
    const sizes = new Set<string>();
    this.product()?.variants?.forEach(variant => {
      const size = variant.attributes['Taille'] || variant.attributes['Size'];
      if (size) sizes.add(size);
    });
    return Array.from(sizes);
  });

  currentVariant = computed(() => {
    if (!this.product()?.hasVariants || !this.product()?.variants) {
      return null;
    }

    return this.product()?.variants?.find(variant => {
      const variantColor = variant.attributes['Couleur'] || variant.attributes['Color'];
      const variantSize = variant.attributes['Taille'] || variant.attributes['Size'];

      // Vérifier si les attributs sélectionnés correspondent à la variante
      const colorMatch = !this.selectedAttributes().has('color') || this.selectedAttributes().get('color') === variantColor;
      const sizeMatch = !this.selectedAttributes().has('size') || this.selectedAttributes().get('size') === variantSize;

      return colorMatch && sizeMatch;
    }) || null;
  });

  minPrice = computed(() => {
    if (!this.product()?.hasVariants || !this.product()?.variants) return this.product()?.price || 0;
    const prices = this.product()?.variants?.map(v => v.price) || [this.product()?.price || 0];
    return Math.min(...prices);
  });

  maxPrice = computed(() => {
    if (!this.product()?.hasVariants || !this.product()?.variants) return this.product()?.price || 0;
    const prices = this.product()?.variants?.map(v => v.price) || [this.product()?.price || 0];
    return Math.max(...prices);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.productId.set(id);
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        const foundProduct = products.find(p => p._id === id);
        if (foundProduct) {
          this.product.set(foundProduct);
          if (foundProduct.images && foundProduct.images.length > 0) {
            this.selectedImage.set(foundProduct.images[0]);
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
      }
    });
  }

  selectImage(image: string): void {
    this.selectedImage.set(image);
  }

  selectAttribute(attribute: string, value: string): void {
    const newAttributes = new Map(this.selectedAttributes());
    if (newAttributes.get(attribute) === value) {
      // Désélectionner si déjà sélectionné
      newAttributes.delete(attribute);
    } else {
      // Sélectionner la nouvelle valeur
      newAttributes.set(attribute, value);
    }
    this.selectedAttributes.set(newAttributes);
  }

  increaseQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decreaseQuantity(): void {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  isAttributeAvailable(attribute: string, value: string): boolean {
    if (!this.product()?.hasVariants || !this.product()?.variants) return true;

    // Vérifier si une combinaison avec cet attribut existe et est en stock
    return this.product()?.variants?.some(variant => {
      const variantColor = variant.attributes['Couleur'] || variant.attributes['Color'];
      const variantSize = variant.attributes['Taille'] || variant.attributes['Size'];

      // Construire les conditions de correspondance
      let colorMatch = true;
      let sizeMatch = true;

      if (attribute === 'color') {
        colorMatch = variantColor === value;
        sizeMatch = !this.selectedAttributes().has('size') || this.selectedAttributes().get('size') === variantSize;
      } else if (attribute === 'size') {
        sizeMatch = variantSize === value;
        colorMatch = !this.selectedAttributes().has('color') || this.selectedAttributes().get('color') === variantColor;
      }

      return colorMatch && sizeMatch && variant.stock > 0;
    }) || false;
  }

  addToCart(): void {
    const prod = this.product();
    const variant = this.currentVariant();

    if (!prod || !variant) {
      console.warn('Impossible d\'ajouter au panier: produit ou variante non disponible');
      return;
    }

    this.cartService.addToCart(prod, variant, this.quantity());
  }
}