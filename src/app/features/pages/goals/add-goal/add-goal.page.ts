import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  IonContent,
  IonIcon,
  IonToggle,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import { GoalType } from '../../../../core/models/goal.model';

@Component({
  selector: 'app-add-goal',
  templateUrl: './add-goal.page.html',
  styleUrls: ['./add-goal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonToggle,
  ],
})
export class AddGoalPage {
  loading = false;
  errorMessage = '';

  form = {
    title: '',
    description: '',
    goalType: 'JOB_SEARCH' as GoalType,
    targetDate: '',
    useAiPlan: true,
  };

  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {
    addIcons({
      chevronBackOutline,
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/goals');
  }

  createGoal(): void {
    this.errorMessage = '';

    if (!this.form.title.trim()) {
      this.errorMessage = 'Please enter goal title.';
      return;
    }

    if (!this.form.targetDate) {
      this.errorMessage = 'Please select target date.';
      return;
    }

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      goalType: this.form.goalType,
      targetDate: this.form.targetDate,
      useAiPlan: this.form.useAiPlan,
    };

    this.loading = true;

    this.apiService
      .createGoal(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: any) => {
          const goal = response?.data || response;
          const goalId = goal?.id || goal?._id;

          if (goalId) {
            this.router.navigateByUrl(`/goals/${goalId}`);
            return;
          }

          this.router.navigateByUrl('/goals');
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Unable to create goal. Please try again.';
        },
      });
  }
}