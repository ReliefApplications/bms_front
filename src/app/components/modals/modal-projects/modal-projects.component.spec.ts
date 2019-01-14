import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProjectsComponent } from './modal-projects.component';

describe('ModalLanguageComponent', () => {
  let component: ModalProjectsComponent;
  let fixture: ComponentFixture<ModalProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
