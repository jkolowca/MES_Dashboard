import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiStateService } from '../../core/services/ui-state.service';
import { NavigationService } from '../../core/services/navigation.service';
import { ButtonModule } from 'primeng/button';
import { PIcon } from '@primeicons/angular/p-icon';
import { SidebarModule } from 'primeng/sidebar';
import { UserProfileWidgetComponent } from './user-profile-widget/user-profile-widget.component';

/**
 * Primary navigation sidebar.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, ButtonModule, PIcon, SidebarModule, UserProfileWidgetComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  public readonly uiStateService = inject(UiStateService);
  public readonly navigationService = inject(NavigationService);
}
