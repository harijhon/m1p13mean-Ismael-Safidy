import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '../../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private http = inject(HttpClient);
  private apiUrl = '/api/stores';

  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(this.apiUrl);
  }

  createStore(store: Store): Observable<Store> {
    return this.http.post<Store>(this.apiUrl, store);
  }

  updateStore(store: Store): Observable<Store> {
    return this.http.put<Store>(`${this.apiUrl}/${store._id}`, store);
  }

  deleteStore(id: string): Observable<object> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMyStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.apiUrl}/my-stores`);
  }

  updateMyStore(store: Store): Observable<Store> {
    return this.http.put<Store>(`${this.apiUrl}/my-store`, store);
  }
}
