import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { CartItem } from '../../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Votre Panier</h1>

      @if (cartService.cartItems().length === 0) {
        <div class="text-center py-12 border border-dashed rounded-lg">
          <i class="pi pi-shopping-cart text-6xl text-gray-300"></i>
          <p class="mt-4 text-gray-500">Votre panier est vide.</p>
          <a routerLink="/store" class="mt-6 inline-block bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition">
            Continuer mes achats
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Liste des articles -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm">
              <ul>
                @for (item of cartService.cartItems(); track item.variantSku) {
                  <li class="flex items-center p-4 border-b">
                    <img [src]="item.image || 'https://www.primefaces.org/cdn/primeng/images/demo/product-placeholder.svg'" [alt]="item.name" class="w-20 h-20 object-cover rounded-md mr-4">
                    <div class="flex-grow">
                      <h2 class="font-semibold text-gray-800">{{ item.name }}</h2>

                      <p class="text-sm text-red-500 font-bold">{{ item.price | currency:'MGA':'Ar ':'1.0-0' }}</p>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="font-semibold">x {{ item.quantity }}</span>
                      <button (click)="cartService.removeFromCart(item.productId, item.variantSku)" class="text-gray-400 hover:text-red-500">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </li>
                }
              </ul>
              <div class="p-4">
                <button (click)="cartService.clearCart()" class="text-sm text-gray-500 hover:text-red-500">
                  Vider le panier
                </button>
              </div>
            </div>
          </div>

          <!-- Résumé de la commande -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 class="text-xl font-bold border-b pb-4 mb-4">Résumé</h2>
              <div class="flex justify-between mb-2">
                <span>Sous-total</span>
                <span>{{ cartService.totalAmount() | currency:'MGA':'Ar ':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span>Livraison</span>
                <span>Gratuite</span>
              </div>
              <div class="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{{ cartService.totalAmount() | currency:'MGA':'Ar ':'1.0-0' }}</span>
              </div>
              <button 
                (click)="checkout()" 
                [disabled]="isCheckingOut()"
                class="mt-6 w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (isCheckingOut()) {
                  <span>En cours...</span>
                } @else {
                  <span>Passer la commande</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CartComponent {
  protected cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  isCheckingOut = signal(false);



  checkout(): void {
    this.isCheckingOut.set(true);
    const items = this.cartService.cartItems();

    this.orderService.createOrder(items).subscribe({
      next: (response) => {
        console.log('Commande créée avec succès', response);
        this.cartService.clearCart();
        this.isCheckingOut.set(false);
        // Optionnel: Rediriger vers une page de confirmation
        this.router.navigate(['/store']);
        // Idéalement, naviguer vers une page /order-success/{orderId}
      },
      error: (error) => {
        console.error('Erreur lors de la création de la commande', error);
        this.isCheckingOut.set(false);
        // Idéalement, afficher un message d'erreur à l'utilisateur
      }
    });
  }
}
