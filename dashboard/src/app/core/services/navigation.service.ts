import { Injectable, computed, inject } from '@angular/core';
import { UserService } from './user.service';

/** Defines the structure for a navigation menu item. */
export interface MenuItem {
  route: string;
  label: string;
  icon: string;
  roles: string[];
}

/**
 * Mock navigation service that filters menu items based on user role.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly userService = inject(UserService);

  private readonly allMenuItems: MenuItem[] = [
    { route: '/', label: $localize`Dashboard`, icon: 'chart-pie', roles: ['operator', 'admin', 'maintenance'] },
    { route: '/sensors', label: $localize`Sensors`, icon: 'microchip', roles: ['operator', 'admin', 'maintenance'] },
    { route: '/analytics', label: $localize`Analytics`, icon: 'chart-line', roles: ['admin'] },
    { route: '/maintenance', label: $localize`Maintenance`, icon: 'wrench', roles: ['admin', 'maintenance'] }
  ];

  /** Filtered navigation items based on the user's role. */
  public readonly menuItems = computed(() => {
    const role = this.userService.currentUser().role;
    return this.allMenuItems.filter(item => item.roles.includes(role));
  });
}
