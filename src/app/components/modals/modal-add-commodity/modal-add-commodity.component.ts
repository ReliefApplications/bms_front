import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { CommodityService } from 'src/app/core/api/commodity.service';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { FormService } from 'src/app/core/utils/form.service';
import { Commodity } from 'src/app/models/commodity';
import { CURRENCIES } from 'src/app/models/constants/currencies';

@Component({
    selector: 'app-modal-add-commodity',
    templateUrl: './modal-add-commodity.component.html',
    styleUrls: ['../modal-fields/modal-fields.component.scss', './modal-add-commodity.component.scss']
})
export class ModalAddCommodityComponent implements OnInit {
    public commodity: Commodity;
    public fields: string[];
    public form: FormGroup;
    public displayWeight = false;
    public iconAdvanced = 'arrow_drop_down';
    public isCurrency = false;
    public currencies = CURRENCIES;
    public localCurrency = 'USD';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        private commodityService: CommodityService,
        public modalReference: MatDialogRef<any>,
        public languageService: LanguageService,
        public asyncacheService: AsyncacheService,
        private countryService: CountriesService,
        public formService: FormService,
    ) { }

    ngOnInit() {
        this.commodity = new Commodity();
        this.fields = Object.keys(this.commodity.fields);
        this.makeForm();
        this.loadModalities();
        this.localCurrency = this.formService.getLocalCurrency();
        this.currencies = this.formService.pushLocalCurrencyOnTop(this.currencies, this.localCurrency);
    }

    makeForm() {
        const formControls = {};
        this.fields.forEach((fieldName: string) => {
            const field = this.commodity.fields[fieldName];
            const validators = this.formService.getFieldValidators(field.isRequired, field.pattern);
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
        // Set the value (Booklet value, value, quantity..)
        switch (modalityId) {
            case 2: // Vouchers
                this.commodity.fields.value.title = this.language.commodity_value_voucher;
                break;
            default:
                this.commodity.fields.value.title = this.language.commodity_value;
        }
        this.form.controls.modalityType.setValue(null);
        this.form.controls.unit.setValue('');
    }

    getUnit(): string {
        switch (this.form.controls.modalityType.value) {
            case 1: // Mobile Cash
            case 2: // QR Code Voucher
            case 3: // Paper Voucher
            case 12: // Loan
                return this.language.currency;
            default:
                return this.language.unit;
        }
    }

    setUnit() {
        this.isCurrency = false;
        switch (this.form.controls.modalityType.value) {
            case 1: // Mobile Cash
            case 2: // QR Code Voucher
            case 3: // Paper Voucher
            case 12: // Loan
                this.isCurrency = true;
                this.form.controls.unit.setValue(this.localCurrency);
                break;
            case 4: // Food
            case 5: // RTE Kit
            case 7: // Agricultural Kit
            case 8: // Wash kit
            case 9: // Shelter tool kit
            case 10: // Hygiene kit
            case 11: // Dignity kit
                this.form.controls.unit.setValue(this.language.commodity_kit);
                break;
            case 6: // Bread
                this.form.controls.unit.setValue(this.language.commodity_kgs);
                break;
            default:
                this.form.controls.unit.setValue('');
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
