import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMobileVouchersComponent } from './table-mobile-vouchers.component';

describe('TableMobileVouchersComponent', () => {
  let component: TableMobileVouchersComponent;
  let fixture: ComponentFixture<TableMobileVouchersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableMobileVouchersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableMobileVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
