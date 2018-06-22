import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetailsComponent } from './modal-details.component';

describe('ModalDetailsComponent', () => {
  let component: ModalDetailsComponent;
  let fixture: ComponentFixture<ModalDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
