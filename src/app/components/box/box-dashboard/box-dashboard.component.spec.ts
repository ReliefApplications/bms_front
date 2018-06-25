import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxDashboardComponent } from './box-dashboard.component';

describe('BoxDashboardComponent', () => {
  let component: BoxDashboardComponent;
  let fixture: ComponentFixture<BoxDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
