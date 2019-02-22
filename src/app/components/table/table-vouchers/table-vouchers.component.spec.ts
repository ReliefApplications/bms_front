import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableVouchersComponent } from './table-vouchers.component';

describe('TableVouchersComponent', () => {
  let component: TableVouchersComponent;
  let fixture: ComponentFixture<TableVouchersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableVouchersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
