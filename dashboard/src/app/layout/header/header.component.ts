import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { DatePipe } from '@angular/common';

/**
 * Top layout header bar.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, SidebarModule, DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public readonly timestamp = signal(new Date());
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    const intervalId = setInterval(() => this.timestamp.set(new Date()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }
}
