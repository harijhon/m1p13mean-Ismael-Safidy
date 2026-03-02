import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  // Dynamic signals for the Profile Hub
  user = computed(() => {
    const currentUser = this.authService.currentUser();
    return {
      name: currentUser?.name || 'Client',
      email: currentUser?.email || '',
      initials: this.getInitials(currentUser?.name)
    };
  });

  orderStats = signal({
    unpaid: 0,
    processing: 2,
    shipped: 1
  });

  latestOrder = signal({
    id: '#ORD-9876',
    date: '28 Fév 2026',
    status: 'Expédié',
    total: 136000
  });

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
