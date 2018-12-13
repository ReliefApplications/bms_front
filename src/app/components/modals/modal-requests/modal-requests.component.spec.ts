import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRequestsComponent } from './modal-requests.component';

describe('ModalRequestsComponent', () => {
  let component: ModalRequestsComponent;
  let fixture: ComponentFixture<ModalRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
