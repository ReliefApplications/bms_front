import { Component, OnInit, Input, EventEmitter, Output                          } from '@angular/core';
import { ModalComponent                                                          } from '../modal.component';
import { Donor                                                                   } from '../../../model/donor';

@Component({
  selector: 'modal-update',
  templateUrl: './modal-update.component.html',
  styleUrls: ['./modal-update.component.scss']
})
export class ModalUpdateComponent extends ModalComponent {

  @Input() data:    any;
  @Output() onUpdate = new EventEmitter();
  updateObject: any;

  ngOnInit() {
    this.entityInstance = this.data.mapper.instantiate(this.data.entity);
    this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapperUpdate(this.entityInstance));
    console.log("hi : ", this.properties);
    this.propertiesTypes = this.entityInstance.getModalTypeProperties(this.entityInstance);
    try{
      this.updateObject = this.entityInstance.mapAllProperties(this.data.data);
    } catch (e) {
      console.error("the function mapAllProperties is not defined for the entity ", this.entityInstance);
    }
    this.loadData();
  }

  /**
   * emit the object updated 
   */
  save():any {
    this.onUpdate.emit(this.updateObject);
    this.closeDialog();
  }
}
