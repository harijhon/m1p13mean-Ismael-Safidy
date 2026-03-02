import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItemPayload {
  product: string;
  variantSku?: string;
  quantity: number;
  priceAtMoment: number;
}

export interface OrderPayload {
  items: OrderItemPayload[];
  totalAmount: number;
  customerInfo?: any;
  shippingInfo?: any;
  paymentMethod?: string;
  store?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) { }

  createOrder(orderData: OrderPayload): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }

  getStoreOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
