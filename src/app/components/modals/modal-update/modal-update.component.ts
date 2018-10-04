import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { Donor } from '../../../model/donor';

@Component({
  selector: 'modal-update',
  templateUrl: './modal-update.component.html',
  styleUrls: ['./modal-update.component.scss']
})
export class ModalUpdateComponent extends ModalComponent {

  @Input() data: any;
  @Output() onUpdate = new EventEmitter();
  updateObject: any;

  ngOnInit() {
    console.log("init");
    this.entityInstance = this.data.mapper.instantiate(this.data.entity);
    // console.log(this.data);
    this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapperUpdate(this.entityInstance, this.data.data));

    this.propertiesTypes = this.entityInstance.getModalTypeProperties(this.entityInstance);
    try {
      this.updateObject = this.entityInstance.mapAllProperties(this.data.data);
    } catch (e) {
      console.error('the function mapAllProperties is not defined for the entity ', this.entityInstance);
    }
    this.loadData();
  }

  /**
   * emit the object updated
   */
  save(): any {

    if (typeof this.updateObject.start_date == "object") {
      let day = this.updateObject.start_date.getDate();
      let month = this.updateObject.start_date.getMonth() + 1;
      const year = this.updateObject.start_date.getFullYear();

      if (day < 10)
        day = "0" + day;
      if (month < 10)
        month = "0" + month;
      this.updateObject.start_date = year + "-" + month + "-" + day;
    }

    if (typeof this.updateObject.end_date == "object") {
      let day = this.updateObject.end_date.getDate();
      let month = this.updateObject.end_date.getMonth() + 1;
      const year = this.updateObject.end_date.getFullYear();

      if (day < 10)
        day = "0" + day;
      if (month < 10)
        month = "0" + month;
      this.updateObject.end_date = year + "-" + month + "-" + day;
    }
    
    this.onUpdate.emit(this.updateObject);
    this.closeDialog();
  }
}
