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
  styles: []
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

    const credentials = {
      email: this.loginForm.get('email')?.value || '',
      password: this.loginForm.get('password')?.value || ''
    };

    this.authService.login(credentials).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err) => {
        this.error = err?.error?.message || 'Échec de la connexion.';
      }
    });
  }
}