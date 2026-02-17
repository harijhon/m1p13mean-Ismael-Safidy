import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = '/api/dashboard/stats';
  private refreshSource = new Subject<void>();

  // Observable stream for components to subscribe to
  refresh$ = this.refreshSource.asObservable();

  constructor(private http: HttpClient) { }

  getStats(storeId?: string): Observable<any> {
    const options = storeId ? { params: { storeId } } : {};
    return this.http.get<any>(this.apiUrl, options);
  }

  /**
   * Triggers a refresh event for all subscribed components.
   */
  triggerRefresh(): void {
    this.refreshSource.next();
  }
}