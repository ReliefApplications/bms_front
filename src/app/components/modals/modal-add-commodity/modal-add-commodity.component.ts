import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { CommodityService } from 'src/app/core/api/commodity.service';
import { FieldService } from 'src/app/core/utils/field.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { Commodity } from 'src/app/models/commodity';


@Component({
    selector: 'app-modal-add-commodity',
    templateUrl: './modal-add-commodity.component.html',
    styleUrls: [ '../modal-fields/modal-fields.component.scss', './modal-add-commodity.component.scss' ]
})
export class ModalAddCommodityComponent implements OnInit {
    public commodity: Commodity;
    public fields: string[];
    public form: FormGroup;
    public displayWeight = false;
    public iconAdvanced = 'arrow_drop_down';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private commodityService: CommodityService,
        public modalReference: MatDialogRef<any>,
        public fieldService: FieldService,
        public languageService: LanguageService
    ) {}

    ngOnInit() {
        this.commodity = new Commodity();
        this.fields = Object.keys(this.commodity.fields);
        this.makeForm();
        this.loadModalities();
    }

    makeForm() {
        const formControls = {};
        this.fields.forEach((fieldName: string) => {
            const field = this.commodity.fields[fieldName];
            const validators = this.fieldService.getFieldValidators(field.isRequired, field.pattern);
            formControls[fieldName] = new FormControl(
                {
                    value: this.commodity.get(fieldName),
                    disabled: field.isDisabled
                },
                validators
            );
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
            case 2: // QR Code Voucher
            case 3: // Paper Voucher
            case 13: // Loan
                return this.language.model_currency;
            case 4: // Food
            case 5: // RTE Kit
            case 7: // Agricultural Kit
            case 8: // Wash kit
            case 10: // Shelter tool kit
            case 11: // Hygiene kit
            case 12: // Dignity kit
                return this.language.model_commodity_kit;
            case 6: // Bread
                return this.language.model_commodity_kgs;
            default:
                return this.language.model_commodity_unit;
        }
    }

    onCancel() {
        this.modalReference.close();
    }

    onSubmit() {
        for (const field of this.fields) {
            if (this.form.controls[field].value && this.commodity.fields[field].kindOfField === 'SingleSelect') {
                this.commodity.set(
                    field,
                    this.commodity.getOptions(field).filter((option) => {
                        return option.get('id') === this.form.controls[field].value;
                    })[0]
                );
            } else {
                this.commodity.set(field, this.form.controls[field].value);
            }
        }

        this.modalReference.close(this.commodity);
    }
}
