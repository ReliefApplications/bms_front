import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDistributionComponent } from './import-distribution.component';

describe('ImportDistributionComponent', () => {
  let component: ImportDistributionComponent;
  let fixture: ComponentFixture<ImportDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
