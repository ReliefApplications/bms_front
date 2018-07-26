import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddLineComponent } from './modal-add-line.component';

describe('ModalAddLineComponent', () => {
  let component: ModalAddLineComponent;
  let fixture: ComponentFixture<ModalAddLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
