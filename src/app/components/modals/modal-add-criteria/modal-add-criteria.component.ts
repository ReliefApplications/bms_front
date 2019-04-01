import { Component, OnInit, DoCheck, ViewChildren, QueryList, Input } from '@angular/core';
import { GlobalText } from 'src/texts/global';

import { DateAdapter, MAT_DATE_FORMATS, MatDialogRef } from '@angular/material';
import {CustomDateAdapter, APP_DATE_FORMATS} from 'src/app/core/utils/date.adapter';
import { CriteriaService } from 'src/app/core/api/criteria.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Criteria } from 'src/app/model/criteria.new';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-modal-add-criteria',
    templateUrl: './modal-add-criteria.component.html',
    styleUrls: ['../modal-fields/modal-fields.component.scss', './modal-add-criteria.component.scss'],
    providers: [
      { provide: DateAdapter, useClass: CustomDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ModalAddCriteriaComponent implements OnInit {

  public texts =  GlobalText.TEXTS;
  public objectInstance: Criteria;
  public objectFields: string[];
  public form: FormGroup;
  public displayWeight = false;
  public iconAdvanced = 'arrow_drop_down';
  public language = GlobalText.language;


  constructor(private criteriaService: CriteriaService, public modalReference: MatDialogRef<any>, ) {}

  ngOnInit() {
    this.objectInstance = new Criteria();
    this.objectFields = ['field', 'condition', 'value', 'weight'];
    this.makeForm();
    this.loadFields();
  }


  makeForm() {
    const formControls = {};
    this.objectFields.forEach((fieldName: string) => {
        formControls[fieldName] = new FormControl(this.objectInstance.fields[fieldName].value);
    });
    this.form = new FormGroup(formControls);
  }

  loadFields() {
    this.criteriaService.fillFieldOptions(this.objectInstance);
      this.form.controls.condition.setValue(null);
      this.form.controls.value.setValue(null);
  }

  loadConditions(fieldName) {
    if (fieldName) {
        this.criteriaService.fillConditionOptions(this.objectInstance, fieldName);
    }
    this.form.controls.condition.setValue(null);
    this.form.controls.value.setValue(null);
}

  /**
   * Function to change the value of the displayWeight variable
   * and the icon used
   */
  changeDisplay() {
      this.displayWeight = !this.displayWeight;

      if (this.displayWeight) {
          this.iconAdvanced = 'arrow_drop_up';
      } else {
          this.iconAdvanced = 'arrow_drop_down';
      }
  }

  onCancel() {
    this.modalReference.close();
  }

  onSubmit() {

      for (const field of this.objectFields) {
        this.objectInstance.fields[field].value = this.form.controls[field].value;

        // In case the criteria is the dateOfBirth
        if (this.form.controls[field].value instanceof Date) {
          const datePipe = new DatePipe('en-US');
          this.objectInstance.fields[field].value = datePipe.transform(this.form.controls[field].value, 'yyyy-MM-dd');
        }
      }
      // get the information about the field with the selected field name
      this.objectInstance.fields.field.options.forEach((option) => {
        if (option.fields.field.value === this.objectInstance.fields.field.value ) {
          this.objectInstance.fields.kindOfBeneficiary.value = option.fields.kindOfBeneficiary.value;
          this.objectInstance.fields.tableString.value = option.fields.tableString.value;
          this.objectInstance.fields.type.value = option.fields.type.value;
        }
      });
      this.modalReference.close(this.objectInstance);
  }
}

