import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { IonContent, IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  contrastOutline,
  moonOutline,
  phonePortraitOutline,
  sunnyOutline,
} from 'ionicons/icons';

type ThemeMode = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-appearance',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss'],
})
export class AppearanceComponent implements OnInit, OnDestroy {
  selectedTheme: ThemeMode = 'system';

  themeOptions = [
    {
      id: 'system' as ThemeMode,
      title: 'System Default',
      description: 'Match your device appearance automatically',
      icon: 'phone-portrait-outline',
    },
    {
      id: 'light' as ThemeMode,
      title: 'Light Mode',
      description: 'Clean bright interface with blue accents',
      icon: 'sunny-outline',
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Dark Mode',
      description: 'Comfortable dark interface for night use',
      icon: 'moon-outline',
    },
  ];

  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(private readonly router: Router) {
    addIcons({
      arrowBackOutline,
      checkmarkCircleOutline,
      contrastOutline,
      moonOutline,
      phonePortraitOutline,
      sunnyOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    const savedTheme = await Preferences.get({
      key: 'nextstep-theme-mode',
    });

    this.selectedTheme = (savedTheme.value as ThemeMode) || 'system';
    this.applyTheme(this.selectedTheme);

    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
  }

  ngOnDestroy(): void {
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  async selectTheme(theme: ThemeMode): Promise<void> {
    this.selectedTheme = theme;

    await Preferences.set({
      key: 'nextstep-theme-mode',
      value: theme,
    });

    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    document.body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'light') {
      document.body.classList.add('light-theme');
      return;
    }

    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      return;
    }

    const prefersDark = this.mediaQuery.matches;
    document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
  }

  private handleSystemThemeChange = (): void => {
    if (this.selectedTheme === 'system') {
      this.applyTheme('system');
    }
  };
}