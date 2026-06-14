import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GmailPage } from './gmail.page';

describe('GmailPage', () => {
  let component: GmailPage;
  let fixture: ComponentFixture<GmailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
