import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderMapComponent } from './placeholder-map.component';

describe('PlaceholderMapComponent', () => {
  let component: PlaceholderMapComponent;
  let fixture: ComponentFixture<PlaceholderMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
