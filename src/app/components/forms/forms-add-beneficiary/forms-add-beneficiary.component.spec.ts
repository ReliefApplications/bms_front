import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsAddBeneficiaryComponent } from './forms-add-beneficiary.component';


describe('FormsAddBeneficiaryComponent', () => {
  let component: FormsAddBeneficiaryComponent;
  let fixture: ComponentFixture<FormsAddBeneficiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormsAddBeneficiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormsAddBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
