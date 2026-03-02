import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, interval, Subscription } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface AppNotification {
    _id: string;
    type: 'BOX_REQUEST' | 'STORE_VALIDATED' | 'PRE_NOTICE_ALERT' | 'GENERAL';
    message: string;
    isRead: boolean;
    relatedStore?: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private apiUrl = `${environment.apiUrl}/notifications`;

    // Reactive State
    notifications = signal<AppNotification[]>([]);
    unreadCount = signal<number>(0);

    private pollingSubscription?: Subscription;

    constructor() {
        // Start polling when service is instantiated and user is logged in
        this.setupPolling();
    }

    private setupPolling() {
        // Fetch immediately
        if (this.authService.isLoggedIn()) {
            this.fetchNotifications().subscribe();
        }

        // Then poll every 30 seconds
        this.pollingSubscription = interval(30000).pipe(
            switchMap(() => {
                if (this.authService.isLoggedIn()) {
                    return this.fetchNotifications();
                }
                return [];
            })
        ).subscribe();
    }

    fetchNotifications(): Observable<AppNotification[]> {
        return this.http.get<AppNotification[]>(this.apiUrl).pipe(
            tap(data => {
                this.notifications.set(data);
                this.updateUnreadCount(data);
            })
        );
    }

    markAsRead(id: string): Observable<AppNotification> {
        return this.http.put<AppNotification>(`${this.apiUrl}/${id}/read`, {}).pipe(
            tap(updated => {
                const current = this.notifications();
                const updatedList = current.map(n => n._id === id ? { ...n, isRead: true } : n);
                this.notifications.set(updatedList);
                this.updateUnreadCount(updatedList);
            })
        );
    }

    markAllAsRead(): Observable<any> {
        return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
            tap(() => {
                const current = this.notifications();
                const updatedList = current.map(n => ({ ...n, isRead: true }));
                this.notifications.set(updatedList);
                this.updateUnreadCount(updatedList);
            })
        );
    }

    private updateUnreadCount(data: AppNotification[]) {
        const count = data.filter(n => !n.isRead).length;
        this.unreadCount.set(count);
    }

    ngOnDestroy() {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }
}
