import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderDashboardComponent } from './placeholder-dashboard.component';

describe('PlaceholderDashboardComponent', () => {
  let component: PlaceholderDashboardComponent;
  let fixture: ComponentFixture<PlaceholderDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
