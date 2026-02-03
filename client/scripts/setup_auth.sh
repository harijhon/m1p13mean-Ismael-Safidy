#!/usr/bin/env bash
set -e

echo "Creating auth service and login component scaffold..."
mkdir -p src/app/core/services
mkdir -p src/app/pages/auth/login

cat > src/app/core/services/auth.service.ts <<'EOF'
// AuthService (created by setup_auth.sh)
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/auth';

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
EOF

cat > src/app/pages/auth/login/login.component.ts <<'EOF'
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  error: string | null = null;

  onSubmit(): void {
    this.error = null;
    if (this.loginForm.invalid) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err) => {
        this.error = err?.error?.message || 'Échec de la connexion.';
      }
    });
  }
}
EOF

cat > src/app/pages/auth/login/login.component.html <<'EOF'
<section class="login-page">
  <h2>Se connecter</h2>

  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <div>
      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" />
      <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error">
        Email requis et doit être valide.
      </div>
    </div>

    <div>
      <label for="password">Mot de passe</label>
      <input id="password" type="password" formControlName="password" />
      <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error">
        Mot de passe requis.
      </div>
    </div>

    <div *ngIf="error" class="error">{{ error }}</div>

    <button type="submit">Se connecter</button>
  </form>
</section>
EOF

echo "Scaffold created in src/app/core/services and src/app/pages/auth/login"
