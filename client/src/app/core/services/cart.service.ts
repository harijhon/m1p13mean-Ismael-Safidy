import { Injectable, signal, computed, effect } from '@angular/core';
import { Product, Variant } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'cart';

  cartItems = signal<CartItem[]>([]);

  totalItems = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  totalAmount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  constructor() {
    this.loadCartFromStorage();

    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems()));
      }
    });
  }

  private loadCartFromStorage() {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem(this.storageKey);
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart) as CartItem[];
          this.cartItems.set(parsedCart);
        } catch (error) {
          console.error('Failed to parse cart from localStorage', error);
          this.cartItems.set([]);
        }
      }
    }
  }

  addToCart(product: Product, variant?: Variant, quantity: number = 1) {
    const currentCart = this.cartItems();
    const variantSku = variant ? variant.sku : null;

    // Determine the effective price handling promotions
    let price = variant ? variant.price : product.price;
    if (product.sale && product.sale.isActive && product.sale.salePrice) {
      // Note: The backend natively resolves limits, but we apply the advertised price locally
      price = product.sale.salePrice;
    }

    const itemName = variant ? `${product.name} - ${variant.sku}` : product.name;
    const image = variant && variant.image ? variant.image : (product.images && product.images.length > 0 ? product.images[0] : '');

    const existingItemIndex = currentCart.findIndex(
      item => item.productId === product._id && item.variantSku === variantSku
    );

    if (existingItemIndex > -1) {
      // Item exists, increment quantity
      const updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].price = price; // Update the price in case a promo started
      this.cartItems.set(updatedCart);
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: product._id as string,
        variantSku: variantSku,
        name: itemName,
        price: price,
        quantity: quantity,
        image: image
      };

      this.cartItems.update(items => [...items, newItem]);
    }
  }

  updateQuantity(productId: string, variantSku: string | null, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId, variantSku);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        (item.productId === productId && item.variantSku === variantSku)
          ? { ...item, quantity: quantity }
          : item
      )
    );
  }

  removeFromCart(productId: string, variantSku: string | null) {
    this.cartItems.update(items =>
      items.filter(item => !(item.productId === productId && item.variantSku === variantSku))
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}