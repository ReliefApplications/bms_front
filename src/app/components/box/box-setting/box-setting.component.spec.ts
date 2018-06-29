import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxSettingComponent } from './box-setting.component';

describe('BoxSettingComponent', () => {
  let component: BoxSettingComponent;
  let fixture: ComponentFixture<BoxSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
