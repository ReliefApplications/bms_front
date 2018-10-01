import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderBoxlineComponent } from './placeholder-boxline.component';

describe('PlaceholderBoxlineComponent', () => {
  let component: PlaceholderBoxlineComponent;
  let fixture: ComponentFixture<PlaceholderBoxlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderBoxlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderBoxlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
