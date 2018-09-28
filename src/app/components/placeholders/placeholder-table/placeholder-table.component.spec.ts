import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderTableComponent } from './placeholder-table.component';

describe('PlaceholderTableComponent', () => {
  let component: PlaceholderTableComponent;
  let fixture: ComponentFixture<PlaceholderTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
