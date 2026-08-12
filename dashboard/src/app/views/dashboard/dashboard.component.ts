import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Main dashboard view.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-placeholder">
      <h2>Dashboard Placeholder</h2>
      <hello-vue></hello-vue>
    </div>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardComponent {
}
