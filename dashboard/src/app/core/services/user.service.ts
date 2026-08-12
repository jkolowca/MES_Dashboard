import { Injectable, signal } from '@angular/core';

/** Defines available user roles for RBAC. */
export type UserRole = 'operator' | 'admin' | 'maintenance';

/** Represents a user profile. */
export interface User {
  name: string;
  role: UserRole;
}

/**
 * Mock user service to demonstrate RBAC and profile handling.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  /** Signal holding the current user profile. */
  public readonly currentUser = signal<User>({
    name: 'Jan Kowalski',
    role: 'maintenance'
  });
}
