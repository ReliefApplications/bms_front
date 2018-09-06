import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryImportComponent } from './beneficiary-import.component';

describe('BeneficiaryImportComponent', () => {
  let component: BeneficiaryImportComponent;
  let fixture: ComponentFixture<BeneficiaryImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeneficiaryImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiaryImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
