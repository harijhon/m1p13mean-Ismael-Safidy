import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  error: string | null = null;

  onSubmit(): void {
    this.error = null;
    if (this.registerForm.invalid) {
      this.error = 'Please fill all fields correctly.';
      return;
    }

    const credentials = {
      name: this.registerForm.get('name')?.value || '',
      email: this.registerForm.get('email')?.value || '',
      password: this.registerForm.get('password')?.value || ''
    };

    this.authService.register(credentials).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error = err?.error?.message || 'Registration failed.';
      }
    });
  }
}