import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseholdsImportComponent } from './households-import.component';

describe('HouseholdsImportComponent', () => {
  let component: HouseholdsImportComponent;
  let fixture: ComponentFixture<HouseholdsImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseholdsImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseholdsImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
