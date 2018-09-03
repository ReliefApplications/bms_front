import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBeneficiaryComponent } from './addBeneficiary.component';

describe('AddBeneficiaryComponent', () => {
  let component: AddBeneficiaryComponent;
  let fixture: ComponentFixture<AddBeneficiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBeneficiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
