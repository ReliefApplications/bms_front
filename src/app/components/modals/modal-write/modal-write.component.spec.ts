import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWriteComponent } from './modal-write.component';

describe('ModalWriteComponent', () => {
  let component: ModalWriteComponent;
  let fixture: ComponentFixture<ModalWriteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalWriteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalWriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
