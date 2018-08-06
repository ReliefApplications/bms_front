import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHouseholdComponent } from './addHousehold.component';

describe('AddHouseholdComponent', () => {
  let component: AddHouseholdComponent;
  let fixture: ComponentFixture<AddHouseholdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddHouseholdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHouseholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
