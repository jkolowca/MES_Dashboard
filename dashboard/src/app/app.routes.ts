import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    title: 'A-MES',
    children: [
      {
        path: '',
        canActivate: [roleGuard],
        data: { roles: ['operator', 'admin', 'maintenance'] },
        loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard | A-MES'
      },
      {
        path: 'analytics',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Analytics | A-MES'
      },
      {
        path: '**',
        loadComponent: () => import('./views/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'Not Found | A-MES'
      }
    ]
  }
];
