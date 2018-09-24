import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLeaveComponent } from './modal-leave.component';

describe('ModalLeaveComponent', () => {
  let component: ModalLeaveComponent;
  let fixture: ComponentFixture<ModalLeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalLeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
