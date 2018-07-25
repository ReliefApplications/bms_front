import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSmallComponent } from './table-small.component';

describe('TableSmallComponent', () => {
  let component: TableSmallComponent;
  let fixture: ComponentFixture<TableSmallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableSmallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
