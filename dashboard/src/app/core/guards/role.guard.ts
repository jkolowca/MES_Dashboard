import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService, UserRole } from '../services/user.service';

/**
 * Functional route guard that checks if the current user has the required role
 * to access a route.
 */
export const roleGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUserRole = userService.currentUser().role;

  if (requiredRoles.includes(currentUserRole)) {
    return true;
  }

  return router.createUrlTree(['/not-found']);
};
