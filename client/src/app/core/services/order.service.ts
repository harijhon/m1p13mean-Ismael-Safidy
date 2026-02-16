import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = '/api/orders';

  createOrder(items: CartItem[]): Observable<any> {
    // Transformer les CartItem en un format attendu par le backend si nécessaire
    const orderPayload = {
      items: items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        priceAtMoment: item.price
      })),
      // Le backend calculera le totalAmount
    };
    return this.http.post<any>(this.apiUrl, orderPayload);
  }
}
