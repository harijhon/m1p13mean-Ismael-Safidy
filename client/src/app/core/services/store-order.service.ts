import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreOrderService {
  private http = inject(HttpClient);
  private apiUrl = '/api/orders';

  /**
   * Fetches the order history for the currently authenticated user.
   * @returns An Observable containing an array of orders.
   */
  getMyOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-orders`);
  }
}
