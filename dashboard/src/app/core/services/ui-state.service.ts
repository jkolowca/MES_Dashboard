import { Service, signal, effect, inject, DestroyRef } from '@angular/core';

/**
 * Service responsible for managing global UI state across the application.
 */
@Service()
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

      // Synchronously restore state on initialization to prevent layout flash
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme === 'dark';
      this.isDarkMode.set(isDark);
      this.updateThemeClass(isDark);

      // Keep localStorage and DOM state in sync with signals
      effect(() => {
        const dark = this.isDarkMode();
        this.updateThemeClass(dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      });
    }
  }

  /** Toggles the application theme. */
  public toggleTheme(): void {
    this.isDarkMode.update(v => !v);
  }

  private updateThemeClass(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('app-dark');
    } else {
      document.documentElement.classList.remove('app-dark');
    }
  }
}
