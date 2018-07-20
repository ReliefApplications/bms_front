import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddComponent } from './modal-add.component';

describe('ModalAddComponent', () => {
  let component: ModalAddComponent;
  let fixture: ComponentFixture<ModalAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
