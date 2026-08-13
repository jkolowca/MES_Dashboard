import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { UiStateService } from '../../core/services/ui-state.service';
import { PIcon } from '@primeicons/angular/p-icon';

/**
 * Top layout header bar.
 */
@Component({
  selector: 'app-header',
  imports: [ButtonModule, SidebarModule, DatePipe, PIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public readonly timestamp = toSignal(
    interval(1000).pipe(map(() => new Date())),
    { initialValue: new Date() }
  );

  public readonly uiStateService = inject(UiStateService);
}
