import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDistributionComponent } from './table-distribution.component';

describe('TableDistributionComponent', () => {
  let component: TableDistributionComponent;
  let fixture: ComponentFixture<TableDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
