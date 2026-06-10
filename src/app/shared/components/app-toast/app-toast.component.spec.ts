import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppToastComponent } from './app-toast.component';

describe('AppToastComponent', () => {
  let component: AppToastComponent;
  let fixture: ComponentFixture<AppToastComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
