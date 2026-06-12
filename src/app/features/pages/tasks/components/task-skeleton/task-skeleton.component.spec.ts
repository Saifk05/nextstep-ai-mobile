import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskSkeletonComponent } from './task-skeleton.component';

describe('TaskSkeletonComponent', () => {
  let component: TaskSkeletonComponent;
  let fixture: ComponentFixture<TaskSkeletonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TaskSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
