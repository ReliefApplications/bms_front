import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiariesImportComponent } from './beneficiaries-import.component';

describe('BeneficiariesImportComponent', () => {
  let component: BeneficiariesImportComponent;
  let fixture: ComponentFixture<BeneficiariesImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeneficiariesImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiariesImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
