import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedDataComponent } from './imported-data.component';

describe('ImportedDataComponent', () => {
  let component: ImportedDataComponent;
  let fixture: ComponentFixture<ImportedDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
