import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxPropertiesComponent } from './box-properties.component';

describe('BoxPropertiesComponent', () => {
  let component: BoxPropertiesComponent;
  let fixture: ComponentFixture<BoxPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
