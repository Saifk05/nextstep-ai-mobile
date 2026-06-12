import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskCompleteComponent } from './task-complete.component';

describe('TaskCompleteComponent', () => {
  let component: TaskCompleteComponent;
  let fixture: ComponentFixture<TaskCompleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskCompleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
