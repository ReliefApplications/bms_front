import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmFormComponent } from './adm-form.component';

describe('AdmFormComponent', () => {
  let component: AdmFormComponent;
  let fixture: ComponentFixture<AdmFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdmFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
