import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxReportComponent } from './box-report.component';

describe('BoxReportComponent', () => {
  let component: BoxReportComponent;
  let fixture: ComponentFixture<BoxReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
