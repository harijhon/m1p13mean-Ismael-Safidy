import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface User {
  _id: string;
  email: string;
  role: string;
  name: string;
  storeId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'http://localhost:3000/api/auth';

  private currentUserSig = signal<User | null>(null);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly currentUser = this.currentUserSig.asReadonly();
  isLoggedIn = computed(() => !!this.currentUserSig());
  isAdmin = computed(() => this.currentUserSig()?.role === 'admin');
  isManager = computed(() => this.currentUserSig()?.role === 'manager');

  constructor() {
    this.restoreSession();
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.setSession(response.token);
        }
      })
    );
  }

  register(credentials: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSig.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(token: string): void {
    try {
      const decoded: User = jwtDecode(token);
      this.currentUserSig.set(decoded);
      this.currentUserSubject.next(decoded);
    } catch (error) {
      console.error('Invalid token', error);
      this.logout();
    }
  }

  private restoreSession(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.setSession(token);
    }
  }

  // Méthode pour mettre à jour l'utilisateur
  updateCurrentUser(user: User | null): void {
    this.currentUserSig.set(user);
    this.currentUserSubject.next(user);
  }
}