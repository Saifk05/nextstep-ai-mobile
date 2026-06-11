import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, NavController } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  home,
  mailOutline,
  add,
  walletOutline,
  settingsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent {
  activeTab = 'home';

  constructor(private readonly navCtrl: NavController) {
    addIcons({
      home,
      mailOutline,
      add,
      walletOutline,
      settingsOutline,
    });
  }

  goTo(tab: string): void {
    this.activeTab = tab;

    const routes: Record<string, string> = {
      home: '/dashboard',
      inbox: '/inbox',
      finance: '/finance',
      settings: '/settings',
    };

    this.navCtrl.navigateRoot(routes[tab]);
  }

  openCreate(): void {
    this.navCtrl.navigateForward('/create');
  }
}