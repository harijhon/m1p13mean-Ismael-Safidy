import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ToastModule,
    RouterLink
  ],
  template: `
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md">
        <p-card header="Créer un compte">
          <p-toast position="top-right"></p-toast>
          <div class="p-8">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="field">
              <label for="name" class="block text-sm font-medium mb-1">Nom</label>
              <input 
                pInputText 
                id="name" 
                type="text" 
                formControlName="name" 
                class="w-full"
              />
            </div>
            
            <div class="field">
              <label for="email" class="block text-sm font-medium mb-1">Email</label>
              <input 
                pInputText 
                id="email" 
                type="email" 
                formControlName="email" 
                class="w-full"
              />
            </div>
            
            <div class="field">
              <label for="password" class="block text-sm font-medium mb-1">Mot de passe</label>
              <p-password 
                id="password" 
                formControlName="password" 
                [feedback]="false"
                [toggleMask]="true"
                class="w-full"
              ></p-password>
            </div>
            
            <div class="field">
              <label for="confirmPassword" class="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <p-password 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                [feedback]="false"
                [toggleMask]="true"
                class="w-full"
              ></p-password>
            </div>
            
            <button 
              pButton 
              type="submit" 
              label="S'inscrire" 
              class="w-full"
              [disabled]="registerForm.invalid || isSubmitting"
            ></button>
            
            <div class="text-center mt-4">
              <p>Vous avez déjà un compte ? <a routerLink="/login" class="text-blue-500 hover:underline">Se connecter</a></p>
            </div>
            </form>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      const { name, email, password } = this.registerForm.value;
      
      this.authService.register({ name, email, password }).subscribe({
        next: (response: any) => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Succès', 
            detail: 'Inscription réussie. Veuillez vous connecter.' 
          });
          this.router.navigate(['/login']);
          this.isSubmitting = false;
        },
        error: (error: any) => {
          console.error('Registration error:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erreur', 
            detail: error.error?.message || 'Une erreur est survenue lors de l\'inscription' 
          });
          this.isSubmitting = false;
        }
      });
    }
  }
}