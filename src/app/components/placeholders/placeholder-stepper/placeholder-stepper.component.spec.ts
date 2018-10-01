import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderStepperComponent } from './placeholder-stepper.component';

describe('PlaceholderStepperComponent', () => {
  let component: PlaceholderStepperComponent;
  let fixture: ComponentFixture<PlaceholderStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderStepperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
