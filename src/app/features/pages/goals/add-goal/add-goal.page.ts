import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonToggle,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';

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

  form = {
    title: '',
    description: '',
    goalType: 'JOB_SEARCH',
    targetDate: '',
    useAiPlan: true,
  };

  constructor(private readonly router: Router) {
    addIcons({
      chevronBackOutline,
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/goals');
  }

  createGoal(): void {
    console.log(this.form);

    // Next step:
    // call createGoal API
  }
}