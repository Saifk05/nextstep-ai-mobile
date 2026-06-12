import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { addIcons } from 'ionicons';
import {
  home,
  mailOutline,
  walletOutline,
  settingsOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent implements OnInit, OnDestroy {
  activeTab = 'home';

  private routerSub?: Subscription;

  constructor(
    private readonly navCtrl: NavController,
    private readonly router: Router
  ) {
    addIcons({
      home,
      mailOutline,
      walletOutline,
      settingsOutline,
      checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    this.setActiveTab(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        this.setActiveTab(navEvent.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  goTo(tab: string): void {
    const routes: Record<string, string> = {
      home: '/dashboard',
      inbox: '/inbox',
      tasks: '/tasks',
      finance: '/finance',
      settings: '/settings',
    };

    this.navCtrl.navigateRoot(routes[tab]);
  }

  private setActiveTab(url: string): void {
    if (url.startsWith('/dashboard')) {
      this.activeTab = 'home';
      return;
    }

    if (url.startsWith('/inbox')) {
      this.activeTab = 'inbox';
      return;
    }

    if (url.startsWith('/tasks')) {
      this.activeTab = 'tasks';
      return;
    }

    if (url.startsWith('/finance')) {
      this.activeTab = 'finance';
      return;
    }

    if (url.startsWith('/settings')) {
      this.activeTab = 'settings';
      return;
    }

    this.activeTab = '';
  }
}