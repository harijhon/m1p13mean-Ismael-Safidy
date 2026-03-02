import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  public cartService = inject(CartService);

  // Expose signals to the template
  cartItems = this.cartService.cartItems;
  totalItems = this.cartService.totalItems;
  cartTotal = this.cartService.totalAmount;

  updateQuantity(productId: string, variantSku: string | null, currentQty: number, change: number): void {
    const newQty = currentQty + change;
    if (newQty > 0) {
      this.cartService.updateQuantity(productId, variantSku, newQty);
    }
  }

  removeItem(productId: string, variantSku: string | null): void {
    this.cartService.removeFromCart(productId, variantSku);
  }

  clearCart(): void {
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      this.cartService.clearCart();
    }
  }
}
