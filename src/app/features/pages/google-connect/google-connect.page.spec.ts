import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleConnectPage } from './google-connect.page';

describe('GoogleConnectPage', () => {
  let component: GoogleConnectPage;
  let fixture: ComponentFixture<GoogleConnectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleConnectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
