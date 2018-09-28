import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderBoxComponent } from './placeholder-box.component';

describe('PlaceholderBoxComponent', () => {
  let component: PlaceholderBoxComponent;
  let fixture: ComponentFixture<PlaceholderBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
