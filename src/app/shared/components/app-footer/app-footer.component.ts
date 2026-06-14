import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  home,
  mailOutline,
  settingsOutline,
  walletOutline,
} from 'ionicons/icons';
import { filter, Subscription } from 'rxjs';

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
        this.setActiveTab((event as NavigationEnd).urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  goTo(tab: string): void {
    const routes: Record<string, string> = {
      home: '/dashboard',
      inbox: '/gmail',
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

    if (url.startsWith('/gmail')) {
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