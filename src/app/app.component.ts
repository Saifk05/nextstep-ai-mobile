import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';

import { AppToastComponent } from './shared/components/app-toast/app-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, AppToastComponent],
})
export class AppComponent implements OnInit {
  constructor(private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    await this.loadTheme();
    this.listenForAppDeepLinks();
  }

  private listenForAppDeepLinks(): void {
    App.addListener('appUrlOpen', (event) => {
      const url = event.url || '';

      if (url.includes('settings') && url.includes('google=connected')) {
        this.router.navigate(['/settings'], {
          queryParams: { google: 'connected' },
        });
      }
    });
  }

  private async loadTheme(): Promise<void> {
    const savedTheme = await Preferences.get({
      key: 'nextstep-theme-mode',
    });

    const theme = savedTheme.value || 'system';

    this.applyTheme(theme);
  }

  private applyTheme(theme: string): void {
    document.body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'light') {
      document.body.classList.add('light-theme');
      return;
    }

    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
  }
}