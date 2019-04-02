import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddCommodityComponent } from './modal-add-commodity.component';

describe('ModalAddCommodityComponent', () => {
  let component: ModalAddCommodityComponent;
  let fixture: ComponentFixture<ModalAddCommodityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddCommodityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddCommodityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
