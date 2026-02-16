import { Injectable, signal, computed, effect } from '@angular/core';
import { Product, Variant } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'shopping_cart';
  cartItems = signal<CartItem[]>([]);

  count = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  total = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  constructor() {
    // Load initial cart from localStorage
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(this.storageKey);
      if (savedCart) {
        this.cartItems.set(JSON.parse(savedCart));
      }
    }

    // Effect to save cart to localStorage whenever it changes
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems()));
      }
    });
  }

  addToCart(product: Product, variant: Variant, quantity: number = 1) {
    const existingItemIndex = this.cartItems().findIndex(
      item => item.productId === product._id && item.variantId === variant._id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...this.cartItems()];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedItems);
    } else {
      const newItem: CartItem = {
        productId: product._id!,
        variantId: variant._id!,
        name: product.name,
        price: variant.price,
        quantity: quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : 'https://www.primefaces.org/cdn/primeng/images/demo/product-placeholder.svg',
        attributes: variant.attributes
      };
      this.cartItems.update(items => [...items, newItem]);
    }
  }

  removeFromCart(variantId: string) {
    this.cartItems.update(items => 
      items.filter(item => item.variantId !== variantId)
    );
  }

  updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(variantId);
      return;
    }

    const updatedItems = [...this.cartItems()];
    const itemIndex = updatedItems.findIndex(
      item => item.variantId === variantId
    );

    if (itemIndex !== -1) {
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity };
      this.cartItems.set(updatedItems);
    }
  }

  clearCart() {
    this.cartItems.set([]);
  }
}