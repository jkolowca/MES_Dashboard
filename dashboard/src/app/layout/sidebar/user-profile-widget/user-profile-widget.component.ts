import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UiStateService } from '../../../core/services/ui-state.service';
import { UserService } from '../../../core/services/user.service';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { PIcon } from '@primeicons/angular/p-icon';
import { SidebarModule } from 'primeng/sidebar';

/**
 * Widget displaying user profile, theme toggle, and language settings.
 */
@Component({
  selector: 'app-user-profile-widget',
  imports: [ButtonModule, AvatarModule, PIcon, SidebarModule],
  templateUrl: './user-profile-widget.component.html',
  styleUrl: './user-profile-widget.component.scss'
})
export class UserProfileWidgetComponent {
  public readonly uiStateService = inject(UiStateService);
  public readonly userService = inject(UserService);
  private readonly document = inject(DOCUMENT);

  /** True when the Polish locale bundle is active. Evaluated once — locale never changes mid-session. */
  public readonly isPolish = this.document.location.pathname.startsWith('/pl');

  /** Switches the language via hard reload. */
  public switchLanguage(): void {
    this.document.location.href = this.isPolish ? '/en/' : '/pl/';
  }
}
