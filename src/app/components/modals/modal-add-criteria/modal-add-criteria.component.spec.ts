import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddCriteriaComponent } from './modal-add-criteria.component';

describe('ModalAddCriteriaComponent', () => {
  let component: ModalAddCriteriaComponent;
  let fixture: ComponentFixture<ModalAddCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
