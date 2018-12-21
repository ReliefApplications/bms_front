import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableBeneficiariesOfflineComponent } from './table-beneficiaries-offline.component';

describe('TableBeneficiariesOfflineComponent', () => {
  let component: TableBeneficiariesOfflineComponent;
  let fixture: ComponentFixture<TableBeneficiariesOfflineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableBeneficiariesOfflineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableBeneficiariesOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
