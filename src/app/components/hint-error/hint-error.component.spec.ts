import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HintErrorComponent } from './hint-error.component';

describe('HintErrorComponent', () => {
  let component: HintErrorComponent;
  let fixture: ComponentFixture<HintErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HintErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HintErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
