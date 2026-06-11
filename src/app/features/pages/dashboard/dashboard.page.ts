import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import {
  IonContent,
  // IonRefresher,
  // IonRefresherContent,
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
    AppFooterComponent,
    // IonRefresher,
    // IonRefresherContent,
  ],
})
export class DashboardPage implements OnInit {
  loading = false;
  dashboard: DashboardData | null = null;
  errorMessage = '';

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboard = null;
    this.errorMessage = '';

    this.apiService
      .getDashboardOverview()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response: DashboardResponse) => {
          this.dashboard = response.data;
          console.log('Dashboard Response:', response);
        },
        error: (error: any) => {
          console.error('Dashboard Error:', error);
          this.dashboard = null;
          this.errorMessage =
            'Unable to load dashboard. Please try again.';
        },
      });
  }

  handleRefresh(event: CustomEvent): void {
    this.apiService
      .getDashboardOverview()
      .pipe(
        finalize(() => {
          (event.target as HTMLIonRefresherElement).complete();
        })
      )
      .subscribe({
        next: (response: DashboardResponse) => {
          this.dashboard = response.data;
          this.errorMessage = '';
        },
        error: (error: any) => {
          console.error('Dashboard Refresh Error:', error);
          this.errorMessage =
            'Unable to refresh dashboard. Please try again.';
        },
      });
  }
}