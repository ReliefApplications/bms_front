import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMobileDistributionComponent } from './table-mobile-distribution.component';

describe('TableMobileDistributionComponent', () => {
  let component: TableMobileDistributionComponent;
  let fixture: ComponentFixture<TableMobileDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableMobileDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableMobileDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
