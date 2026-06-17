import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then(
        (m) => m.RegisterPage
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/pages/dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'gmail',
    loadComponent: () =>
      import('./features/pages/gmail/gmail.page').then((m) => m.GmailPage),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/pages/settings/settings.page').then(
        (m) => m.SettingsPage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'settings/profile',
    loadComponent: () =>
      import('./features/pages/settings/profile/profile.page').then(
        (m) => m.ProfilePage
      ),
    canActivate: [authGuard],
  },
  {
    path: 'settings/google-connect',
    loadComponent: () =>
      import('./features/pages/google-connect/google-connect.page').then(
        (m) => m.GoogleConnectPage
      ),
    canActivate: [authGuard],
  },
  // {
  //   path: 'settings/privacy-policy',
  //   loadComponent: () =>
  //     import('./features/pages/privacy-policy/privacy-policy.page').then(
  //       (m) => m.PrivacyPolicyPage
  //     ),
  //   canActivate: [authGuard],
  // },
  // {
  //   path: 'settings/terms-conditions',
  //   loadComponent: () =>
  //     import('./features/pages/terms-conditions/terms-conditions.page').then(
  //       (m) => m.TermsConditionsPage
  //     ),
  //   canActivate: [authGuard],
  // },
  // {
  //   path: 'settings/data-acquisition',
  //   loadComponent: () =>
  //     import('./features/pages/data-acquisition/data-acquisition.page').then(
  //       (m) => m.DataAcquisitionPage
  //     ),
  //   canActivate: [authGuard],
  // },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/pages/tasks/task-list/task-list.component').then(
        (m) => m.TaskListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tasks/add',
    loadComponent: () =>
      import('./features/pages/tasks/task-create/task-create.component').then(
        (m) => m.TaskCreateComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tasks/:id/complete',
    loadComponent: () =>
      import(
        './features/pages/tasks/task-complete/task-complete.component'
      ).then((m) => m.TaskCompleteComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./features/pages/tasks/task-details/task-details.component').then(
        (m) => m.TaskDetailsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];