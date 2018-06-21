import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderMenuTopComponent } from './header-menu-top.component';

describe('HeaderMenuTopComponent', () => {
  let component: HeaderMenuTopComponent;
  let fixture: ComponentFixture<HeaderMenuTopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderMenuTopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderMenuTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
