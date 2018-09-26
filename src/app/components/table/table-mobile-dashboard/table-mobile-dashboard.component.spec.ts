import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMobileDashboardComponent } from './table-mobile-dashboard.component';

describe('TableMobileDashboardComponent', () => {
  let component: TableMobileDashboardComponent;
  let fixture: ComponentFixture<TableMobileDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableMobileDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableMobileDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
