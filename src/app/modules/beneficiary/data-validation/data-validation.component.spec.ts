import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataValidationComponent } from './data-validation.component';

describe('HouseholdsComponent', () => {
  let component: DataValidationComponent;
  let fixture: ComponentFixture<DataValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
