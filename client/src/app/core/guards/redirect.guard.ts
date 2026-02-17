import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { map } from 'rxjs';
import { inject } from '@angular/core';

export const redirectGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map((user: User | null) => {
      if (!user) {
        // Si l'utilisateur n'est pas connecté, le rediriger vers la page de login
        return router.createUrlTree(['/login']);
      }

      // Si l'utilisateur est admin, le rediriger vers le panel admin
      if (user.role === 'admin') {
        return router.createUrlTree(['/admin/dashboard']);
      }

      // Sinon, le rediriger vers le store
      return router.createUrlTree(['/store']);
    })
  );
};