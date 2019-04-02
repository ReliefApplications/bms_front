import { Component, OnInit, DoCheck, ViewChildren, QueryList, Input } from '@angular/core';
import { GlobalText } from 'src/texts/global';

import { DateAdapter, MAT_DATE_FORMATS, MatDialogRef } from '@angular/material';
import {CustomDateAdapter, APP_DATE_FORMATS} from 'src/app/core/utils/date.adapter';
import { CriteriaService } from 'src/app/core/api/criteria.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Criteria } from 'src/app/model/criteria.new';
import { DatePipe } from '@angular/common';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';

@Component({
    selector: 'app-modal-add-criteria',
    templateUrl: './modal-add-criteria.component.html',
    styleUrls: ['../modal-fields/modal-fields.component.scss', './modal-add-criteria.component.scss'],
})
export class ModalAddCriteriaComponent implements OnInit {

  public texts =  GlobalText.TEXTS;
  public criteria: Criteria;
  public fields: string[];
  public form: FormGroup;
  public displayWeight = false;
  public iconAdvanced = 'arrow_drop_down';
  public language = GlobalText.language;

  constructor(
    private criteriaService: CriteriaService,
    public modalReference: MatDialogRef<any>,
    private snackbar: SnackbarService,
  ) {}

  ngOnInit() {
    this.criteria = new Criteria();
    this.fields = Object.keys(this.criteria.fields);
    this.makeForm();
    this.loadFields();
  }


  makeForm() {
    const formControls = {};
    this.fields.forEach((fieldName: string) => {
      formControls[fieldName] = new FormControl(this.criteria.fields[fieldName].value);
    });
    this.form = new FormGroup(formControls);
  }

  loadFields() {
    this.criteriaService.fillFieldOptions(this.criteria);
  }

  loadConditions(fieldName) {
    if (fieldName) {
        this.criteriaService.fillConditionOptions(this.criteria, fieldName);
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

    this.criteria.fields.field.value = { fields: { name: { value: this.form.controls.field.value }}};
    this.criteria.fields.condition.value = this.criteria.fields.condition.options.filter(option => {
      return option.fields.name.value === this.form.controls.condition.value;
    })[0];
    this.criteria.fields.value.value = this.form.controls.value.value;
    this.criteria.fields.weight.value = this.form.controls.weight.value;

    // In case the criteria is the dateOfBirth
    if (this.form.controls.value.value instanceof Date) {
      const datePipe = new DatePipe('en-US');
      this.criteria.fields.value.value = datePipe.transform(this.form.controls.value.value, 'yyyy-MM-dd');
    }

    // get the information about the field with the selected field name
    this.criteria.fields.field.options.forEach((option) => {
      if (option.fields.field.value === this.form.controls.field.value ) {
        this.criteria.fields.kindOfBeneficiary.value = option.fields.kindOfBeneficiary.value;
        this.criteria.fields.tableString.value = option.fields.tableString.value;
        this.criteria.fields.type.value = option.fields.type.value;
      }
    });

    if ((this.form.controls.field.value === 'gender' ||
      this.form.controls.field.value === 'dateOfBirth' ||
      this.form.controls.field.value === 'IDPoor' ||
      this.form.controls.field.value === 'equityCardNo') && !this.form.controls.value.value) {
        this.snackbar.error(this.texts.modal_add_no_value);
    } else {
      this.modalReference.close(this.criteria);
    }
  }
}

