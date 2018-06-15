import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItemBoxComponent } from './menu-item-box.component';

describe('MenuItemBoxComponent', () => {
  let component: MenuItemBoxComponent;
  let fixture: ComponentFixture<MenuItemBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuItemBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
