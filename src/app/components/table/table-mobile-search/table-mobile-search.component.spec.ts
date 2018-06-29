import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMobileSearchComponent } from './table-mobile-search.component';

describe('TableMobileSearchComponent', () => {
  let component: TableMobileSearchComponent;
  let fixture: ComponentFixture<TableMobileSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableMobileSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableMobileSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
