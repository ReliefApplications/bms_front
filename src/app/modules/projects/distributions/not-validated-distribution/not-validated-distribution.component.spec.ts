import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotValidatedDistributionComponent } from './not-validated-distribution.component';

describe('NotValidatedDistributionComponent', () => {
  let component: NotValidatedDistributionComponent;
  let fixture: ComponentFixture<NotValidatedDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotValidatedDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotValidatedDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
