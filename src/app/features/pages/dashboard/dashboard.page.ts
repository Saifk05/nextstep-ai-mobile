import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

import { ApiService } from '../../../core/services/api';
import {
  DashboardData,
  DashboardResponse,
} from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class DashboardPage implements OnInit {
  loading = true;
  dashboard: DashboardData | null = null;

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.apiService.getDashboardOverview().subscribe({
      next: (response: DashboardResponse) => {
        this.dashboard = response.data;
        this.loading = false;
        console.log('Dashboard Response:', response);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Dashboard Error:', error);
      },
    });
  }

  handleRefresh(event: CustomEvent): void {
    this.apiService.getDashboardOverview().subscribe({
      next: (response: DashboardResponse) => {
        this.dashboard = response.data;
        (event.target as HTMLIonRefresherElement).complete();
      },
      error: (error: any) => {
        console.error('Dashboard Refresh Error:', error);
        (event.target as HTMLIonRefresherElement).complete();
      },
    });
  }
}