import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDistributionComponent } from './add-distribution.component';

describe('AddDistributionComponent', () => {
  let component: AddDistributionComponent;
  let fixture: ComponentFixture<AddDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
