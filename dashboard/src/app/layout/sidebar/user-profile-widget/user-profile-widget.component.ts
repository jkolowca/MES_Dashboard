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
  standalone: true,
  imports: [ButtonModule, AvatarModule, PIcon, SidebarModule],
  templateUrl: './user-profile-widget.component.html',
  styleUrl: './user-profile-widget.component.scss'
})
export class UserProfileWidgetComponent {
  public readonly uiStateService = inject(UiStateService);
  public readonly userService = inject(UserService);
  private readonly document = inject(DOCUMENT);

  /** Checks if the Polish bundle is currently active. */
  public isPolish(): boolean {
    return this.document.location.pathname.startsWith('/pl');
  }

  /** Switches the language via hard reload. */
  public switchLanguage(): void {
    if (this.isPolish()) {
      this.document.location.href = '/en/';
    } else {
      this.document.location.href = '/pl/';
    }
  }
}
