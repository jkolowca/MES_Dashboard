import { Injectable, signal, inject, DestroyRef } from '@angular/core';

/**
 * Service responsible for managing global UI state across the application.
 */
@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  /** Signal tracking dark mode state. */
  public readonly isDarkMode = signal(false);
  /** Signal tracking mobile viewport state. */
  public readonly isMobile = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(max-width: 1023px)');
      this.isMobile.set(mql.matches);

      const mqlListener = (e: MediaQueryListEvent) => {
        this.isMobile.set(e.matches);
      };

      mql.addEventListener('change', mqlListener);

      this.destroyRef.onDestroy(() => {
        mql.removeEventListener('change', mqlListener);
      });
    }
  }

  /** Toggles the application theme. */
  public toggleTheme() {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('app-dark');
    } else {
      document.documentElement.classList.remove('app-dark');
    }
  }
}
