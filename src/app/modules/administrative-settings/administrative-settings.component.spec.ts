import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeSettingsComponent } from './administrative-settings.component';

describe('SettingsComponent', () => {
  let component: AdministrativeSettingsComponent;
  let fixture: ComponentFixture<AdministrativeSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrativeSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrativeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
