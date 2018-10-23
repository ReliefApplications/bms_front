import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableBeneficiariesComponent } from './table-mobile-beneficiaries.component';

describe('TableBeneficiariesComponent', () => {
  let component: TableBeneficiariesComponent;
  let fixture: ComponentFixture<TableBeneficiariesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableBeneficiariesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableBeneficiariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
