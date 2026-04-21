import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  dark = signal<boolean>(this.loadPref());

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('dark', this.dark());
      localStorage.setItem('theme', this.dark() ? 'dark' : 'light');
    });
    document.documentElement.classList.toggle('dark', this.dark());
  }

  toggle(): void { this.dark.update(v => !v); }

  private loadPref(): boolean {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
