import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDisplayComponent } from './request-display.component';

describe('RequestDisplayComponent', () => {
  let component: RequestDisplayComponent;
  let fixture: ComponentFixture<RequestDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
