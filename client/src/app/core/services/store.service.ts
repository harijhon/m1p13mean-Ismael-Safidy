import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '../../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private http = inject(HttpClient);
  private apiUrl = '/api/stores';

  activeStore = signal<Store | null>(this.getInitialStore());

  constructor() {
    effect(() => {
      const store = this.activeStore();
      if (store) {
        localStorage.setItem('activeStore', JSON.stringify(store));
      } else {
        localStorage.removeItem('activeStore');
      }
    });
  }

  private getInitialStore(): Store | null {
    const stored = localStorage.getItem('activeStore');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  loadUserStores(): Observable<Store[]> {
    return new Observable<Store[]>(observer => {
      this.getMyStores().subscribe({
        next: (stores) => {
          if (stores && stores.length > 0) {
            // If activeStore is null, or not in the list, set it to the first one safely
            const current = this.activeStore();
            const exists = current ? stores.find(s => s._id === current._id) : null;
            if (!exists) {
              this.activeStore.set(stores[0]);
            }
          } else {
            this.activeStore.set(null);
          }
          observer.next(stores);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

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
