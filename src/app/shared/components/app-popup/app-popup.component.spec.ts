import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppPopupComponent } from './app-popup.component';

describe('AppPopupComponent', () => {
  let component: AppPopupComponent;
  let fixture: ComponentFixture<AppPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
