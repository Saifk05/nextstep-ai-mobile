import { Component, OnInit } from '@angular/core';
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
import {
  briefcaseOutline,
  businessOutline,
  cashOutline,
  chevronBackOutline,
  chevronForwardOutline,
  fitnessOutline,
  flagOutline,
  refreshOutline,
  schoolOutline,
  personOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import {
  CreateGoalRequest,
  GoalCategory,
  GoalTemplate,
} from '../../../../core/models/goal.model';

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
export class AddGoalPage implements OnInit {
  step = 1;

  loadingTemplates = false;
  creating = false;
  errorMessage = '';

  templates: GoalTemplate[] = [];
  filteredTemplates: GoalTemplate[] = [];

  selectedCategory: GoalCategory | null = null;
  selectedTemplate: GoalTemplate | null = null;

  setupAnswers: Record<string, any> = {};

  form = {
    title: '',
    targetDate: '',
  };

  categories: {
    key: GoalCategory;
    label: string;
    icon: string;
  }[] = [
    { key: 'CAREER', label: 'Career', icon: 'briefcase-outline' },
    { key: 'FITNESS', label: 'Fitness', icon: 'fitness-outline' },
    { key: 'STUDY', label: 'Study', icon: 'school-outline' },
    { key: 'FINANCE', label: 'Finance', icon: 'cash-outline' },
    { key: 'BUSINESS', label: 'Business', icon: 'business-outline' },
    { key: 'PERSONAL', label: 'Personal', icon: 'person-outline' },
  ];

  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {
    addIcons({
      briefcaseOutline,
      businessOutline,
      cashOutline,
      chevronBackOutline,
      chevronForwardOutline,
      fitnessOutline,
      flagOutline,
      refreshOutline,
      schoolOutline,
      personOutline,
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loadingTemplates = true;
    this.errorMessage = '';

    this.apiService
      .getGoalTemplates()
      .pipe(finalize(() => (this.loadingTemplates = false)))
      .subscribe({
        next: (response) => {
          this.templates = response || [];
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Unable to load goal templates.';
        },
      });
  }

  selectCategory(category: GoalCategory): void {
    this.selectedCategory = category;
    this.selectedTemplate = null;
    this.setupAnswers = {};

    this.filteredTemplates = this.templates.filter(
      template => template.category === category
    );

    this.step = 2;
  }

  selectTemplate(template: GoalTemplate): void {
    this.errorMessage = '';

    this.apiService.getGoalTemplate(template.slug).subscribe({
      next: (response) => {
        this.selectedTemplate = response || template;
        this.form.title = '';
        this.setupAnswers = {};

        for (const question of this.selectedTemplate.setupQuestions || []) {
          this.setupAnswers[question.key] =
            question.type === 'BOOLEAN' ? false : '';
        }

        this.step = 3;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to load template details.';
      },
    });
  }

  createGoal(): void {
    this.errorMessage = '';

    if (!this.selectedCategory) {
      this.errorMessage = 'Please select a goal category.';
      return;
    }

    if (!this.selectedTemplate) {
      this.errorMessage = 'Please select a goal template.';
      return;
    }

    if (!this.form.title.trim()) {
      this.errorMessage = 'Please enter goal title.';
      return;
    }

    if (!this.form.targetDate) {
      this.errorMessage = 'Please select target date.';
      return;
    }

    for (const question of this.selectedTemplate.setupQuestions || []) {
      const value = this.setupAnswers[question.key];

      if (
        question.required &&
        (value === null || value === undefined || value === '')
      ) {
        this.errorMessage = `Please answer: ${question.label}`;
        return;
      }
    }

    const payload: CreateGoalRequest = {
      title: this.form.title.trim(),
      category: this.selectedCategory,
      templateKey: this.selectedTemplate.key,
      targetDate: this.form.targetDate,
      setupAnswers: this.setupAnswers,
    };

    this.creating = true;

    this.apiService
      .createGoal(payload)
      .pipe(finalize(() => (this.creating = false)))
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

  goBack(): void {
    if (this.step > 1) {
      this.step -= 1;
      return;
    }

    this.router.navigateByUrl('/goals');
  }

  formatOption(option: string): string {
    return option
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  getQuestionType(question: any): string {
  const type =
    question?.type ||
    question?.inputType ||
    question?.questionType ||
    question?.fieldType ||
    'TEXT';

  const normalized = String(type).toUpperCase();

  if (normalized === 'STRING') return 'TEXT';
  if (normalized === 'DROPDOWN') return 'SELECT';
  if (normalized === 'RADIO') return 'SELECT';
  if (normalized === 'CHECKBOX') return 'BOOLEAN';

  return normalized;
}

getQuestionOptions(question: any): string[] {
  if (Array.isArray(question?.options)) {
    return question.options;
  }

  if (Array.isArray(question?.choices)) {
    return question.choices;
  }

  if (Array.isArray(question?.values)) {
    return question.values;
  }

  return [];
}

  getPlaceholder(question: any): string {
  const key = String(question?.key || '').toLowerCase();

  switch (key) {
    case 'targetrole':
      return 'Example: Backend Developer';

    case 'experiencelevel':
      return 'Select experience level';

    case 'targetcompanies':
      return 'Example: Product companies, startups, MNCs';

    case 'dailyapplicationtarget':
      return 'Example: 5';

    case 'currentresumestatus':
      return 'Select resume status';

    default:
      return question?.placeholder || `Enter ${(question?.label || '').toLowerCase()}`;
  }
}

}