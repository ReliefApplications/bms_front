import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFieldsComponent } from './modal-fields.component';

describe('ModalWriteComponent', () => {
  let component: ModalFieldsComponent;
  let fixture: ComponentFixture<ModalFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
