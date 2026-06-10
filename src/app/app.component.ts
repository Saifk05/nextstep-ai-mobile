import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AppToastComponent } from './shared/components/app-toast/app-toast.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, AppToastComponent],
})
export class AppComponent {
  constructor() {}
}