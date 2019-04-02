import { Component, OnInit, DoCheck, ViewChildren, QueryList, Input } from '@angular/core';
import { GlobalText } from 'src/texts/global';

import { MatDialogRef } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';
import { Criteria } from 'src/app/model/criteria.new';
import { DatePipe } from '@angular/common';
import { Commodity } from 'src/app/model/commodity.new';
import { CommodityService } from 'src/app/core/api/commodity.service';

@Component({
  selector: 'app-modal-add-commodity',
  templateUrl: './modal-add-commodity.component.html',
  styleUrls: ['../modal-fields/modal-fields.component.scss', './modal-add-commodity.component.scss']
})
export class ModalAddCommodityComponent implements OnInit {

  public texts =  GlobalText.TEXTS;
  public commodity: Commodity;
  public fields: string[];
  public form: FormGroup;
  public displayWeight = false;
  public iconAdvanced = 'arrow_drop_down';
  public language = GlobalText.language;


  constructor(private commodityService: CommodityService, public modalReference: MatDialogRef<any>, ) {}

  ngOnInit() {
    this.commodity = new Commodity();
    this.fields = Object.keys(this.commodity.fields);
    this.makeForm();
    this.loadModalities();
  }


  makeForm() {
    const formControls = {};
    this.fields.forEach((fieldName: string) => {
      formControls[fieldName] = new FormControl(this.commodity.fields[fieldName].value);
    });
    this.form = new FormGroup(formControls);
  }

  loadModalities() {
    this.commodityService.fillModalitiesOptions(this.commodity);
  }

  loadTypes(modalityId) {
    if (modalityId) {
        this.commodityService.fillTypeOptions(this.commodity, modalityId);
    }
    this.form.controls.modalityType.setValue(null);
  }

  getUnit(): string {
    switch (this.form.controls.modalityType.value) {
        case 1: // Mobile Cash
            return 'Currency';
        case 2: // QR Code Voucher
            return 'Unit';
        case 3: // Food
        case 4: // RTE Kit
        case 6: // Agricultural Kit
        case 7: // Wash kit
            return 'Kit';
        case 5: // Bread
            return 'Kgs';
        case 8: // Loan
            return 'Currency';
        default:
            return 'Unit';
    }
}


  onCancel() {
    this.modalReference.close();
  }

  onSubmit() {
      for (const field of this.fields) {
        if (this.form.controls[field].value && this.commodity.fields[field].kindOfField === 'SingleSelect') {
          this.commodity.fields[field].value = this.commodity.fields[field].options.filter(option => {
              return option.fields.id.value === this.form.controls[field].value;
          })[0];
        } else {
          this.commodity.fields[field].value = this.form.controls[field].value;
        }
      }

      this.modalReference.close(this.commodity);
  }

}
