import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMobileComponent } from './table-mobile.component';

describe('TableMobileComponent', () => {
  let component: TableMobileComponent;
  let fixture: ComponentFixture<TableMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
