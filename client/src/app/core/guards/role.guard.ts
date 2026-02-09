import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as string[];
  const userRole = authService.currentUser()?.role;

  if (userRole && requiredRoles.includes(userRole)) {
    return true;
  }

  // Redirect to dashboard (or login) if access denied
  // Assuming '/admin/dashboard' is a safe default for authenticated users
  router.navigate(['/admin/dashboard']); 
  return false;
};
