import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderTitleComponent } from './placeholder-title.component';

describe('PlaceholderTitleComponent', () => {
  let component: PlaceholderTitleComponent;
  let fixture: ComponentFixture<PlaceholderTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
