import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderPanelComponent } from './placeholder-panel.component';

describe('PlaceholderPanelComponent', () => {
  let component: PlaceholderPanelComponent;
  let fixture: ComponentFixture<PlaceholderPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceholderPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
