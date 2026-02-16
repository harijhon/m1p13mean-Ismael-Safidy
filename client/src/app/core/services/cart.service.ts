import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<any[]>([]);

  count = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  total = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  addToCart(product: Product, variant: any, quantity: number = 1) {
    const existingItemIndex = this.cartItems().findIndex(
      item => item.productId === product._id && item.variantId === variant._id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...this.cartItems()];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedItems);
    } else {
      const newItem = {
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        price: variant.price,
        quantity: quantity,
        image: product.images[0]
      };
      this.cartItems.update(items => [...items, newItem]);
    }
  }

  removeFromCart(productId: string, variantId: string) {
    this.cartItems.update(items => 
      items.filter(item => !(item.productId === productId && item.variantId === variantId))
    );
  }

  updateQuantity(productId: string, variantId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId, variantId);
      return;
    }

    const updatedItems = [...this.cartItems()];
    const itemIndex = updatedItems.findIndex(
      item => item.productId === productId && item.variantId === variantId
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