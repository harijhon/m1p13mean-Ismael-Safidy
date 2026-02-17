import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  template: `
    <div class="profile-page-container bg-gray-50 min-h-screen">
      @if (authService.isLoggedIn()) {
        <div class="profile-content p-4">
          <!-- Profile Header -->
          <header class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <span class="text-white text-3xl font-bold">{{ getInitials(authService.currentUser()?.name) }}</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">{{ authService.currentUser()?.name }}</h1>
              <p class="text-sm text-gray-500">{{ authService.currentUser()?.email }}</p>
            </div>
          </header>

          <!-- Quick Actions -->
          <section class="mb-8">
            <div class="grid grid-cols-3 gap-2 text-center">
              <a class="action-item bg-white p-3 rounded-lg shadow-sm">
                <i class="pi pi-wallet text-xl text-gray-600"></i>
                <span class="block text-xs mt-1">Non payé</span>
              </a>
              <a class="action-item bg-white p-3 rounded-lg shadow-sm">
                <i class="pi pi-box text-xl text-gray-600"></i>
                <span class="block text-xs mt-1">En cours</span>
              </a>
              <a class="action-item bg-white p-3 rounded-lg shadow-sm">
                <i class="pi pi-send text-xl text-gray-600"></i>
                <span class="block text-xs mt-1">Expédié</span>
              </a>
            </div>
          </section>

          <!-- Menu List -->
          <section>
            <ul class="bg-white rounded-lg shadow-sm divide-y">
              <li>
                <a routerLink="orders" class="flex items-center justify-between p-4 w-full text-left">
                  <div class="flex items-center gap-4">
                    <i class="pi pi-list text-gray-600"></i>
                    <span>Mes Commandes</span>
                  </div>
                  <i class="pi pi-angle-right text-gray-400"></i>
                </a>
              </li>
              <li>
                <a class="flex items-center justify-between p-4 w-full text-left">
                  <div class="flex items-center gap-4">
                    <i class="pi pi-map-marker text-gray-600"></i>
                    <span>Adresses</span>
                  </div>
                  <i class="pi pi-angle-right text-gray-400"></i>
                </a>
              </li>
              <li>
                <a class="flex items-center justify-between p-4 w-full text-left">
                  <div class="flex items-center gap-4">
                    <i class="pi pi-question-circle text-gray-600"></i>
                    <span>Support</span>
                  </div>
                  <i class="pi pi-angle-right text-gray-400"></i>
                </a>
              </li>
            </ul>
          </section>

          <!-- Footer -->
          <footer class="mt-8">
            <button (click)="logout()" class="w-full bg-red-500 text-white font-bold p-3 rounded-lg">
              Déconnexion
            </button>
          </footer>
        </div>
      } @else {
        <div class="text-center p-8">
          <p class="mb-4">Veuillez vous connecter pour voir votre profil.</p>
          <button (click)="goToLogin()" class="bg-blue-500 text-white font-bold p-3 rounded-lg">
            Se connecter
          </button>
        </div>
      }
    </div>
  `
})
export class ProfileComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  getInitials(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
