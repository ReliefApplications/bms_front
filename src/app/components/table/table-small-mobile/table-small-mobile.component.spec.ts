import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSmallMobileComponent } from './table-small-mobile.component';

describe('TableSmallMobileComponent', () => {
  let component: TableSmallMobileComponent;
  let fixture: ComponentFixture<TableSmallMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableSmallMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSmallMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
