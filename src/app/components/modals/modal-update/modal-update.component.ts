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
    this.entityInstance = this.data.mapper.instantiate(this.data.entity);
    // console.log(this.data);
    this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapperUpdate(this.entityInstance, this.data.data));

    this.propertiesTypes = this.entityInstance.getModalTypeProperties(this.entityInstance);
    try {
      this.updateObject = this.entityInstance.mapAllProperties(this.data.data);
    } catch (e) {
      console.error('the function mapAllProperties is not defined for the entity ', this.entityInstance);
    }

    this.loadData(this.updateObject);
    if (this.updateObject.email && this.updateObject.username) {
      this.form.controls['emailFormControl'].disable();

      let re = /\ /gi;
      this.updateObject.rights = this.updateObject.rights.replace(re, "");

      if (this.updateObject.rights == "ROLE_PROJECT_MANAGER" || this.updateObject.rights == "ROLE_PROJECT_OFFICER" || this.updateObject.rights == "ROLE_FIELD_OFFICER") 
        this.form.controls['projectsControl'].enable();
    }

  }

  selected(event) {

    if (event.value == "ROLE_PROJECT_MANAGER" || event.value == "ROLE_PROJECT_OFFICER" || event.value == "ROLE_FIELD_OFFICER") {
      this.form.controls['projectsControl'].enable();
      this.form.controls['countryControl'].disable();
    }
    // else if (event.value == "ROLE_REGIONAL_MANAGER" || event.value == "ROLE_COUNTRY_MANAGER" || event.value == "ROLE_READ_ONLY") {
    //   this.form.controls['projectsControl'].disable();
    //   this.form.controls['countryControl'].enable();
    // }
    else {
      this.form.controls['projectsControl'].disable();
      this.form.controls['countryControl'].disable();
    }

  }
  /**
   * emit the object updated
   */
  save(): any {
    if (this.updateObject.start_date) {
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
    }
    else if (this.updateObject.username) {
      if (this.updateObject.rights == "ROLE_PROJECT_MANAGER" || this.updateObject.rights == "ROLE_PROJECT_OFFICER" || this.updateObject.rights == "ROLE_FIELD_OFFICER") {
        if (this.updateObject.projects == undefined) {
          this.snackBar.open('You must defined at least a project with that role', '', { duration: 3000, horizontalPosition: 'right' });
          return;
        }
      }
      else if (this.updateObject.rights == "ROLE_REGIONAL_MANAGER" || this.updateObject.rights == "ROLE_COUNTRY_MANAGER" || this.updateObject.rights == "ROLE_READ_ONLY") {
        this.updateObject.country = "KHM";
        if (this.updateObject.country == undefined) {
          this.snackBar.open('You must defined a country with that role', '', { duration: 3000, horizontalPosition: 'right' });
          return;
        }
      }
    }


    this.onUpdate.emit(this.updateObject);
    this.closeDialog();
  }
}
