import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderSummaryComponent } from './placeholder-summary.component';

describe('PlaceholderSummaryComponent', () => {
  let component: PlaceholderSummaryComponent;
  let fixture: ComponentFixture<PlaceholderSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
