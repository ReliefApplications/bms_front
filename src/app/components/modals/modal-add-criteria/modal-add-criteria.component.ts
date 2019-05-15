import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS } from '@angular/material';
import { CriteriaService } from 'src/app/core/api/criteria.service';
import { FormService } from 'src/app/core/utils/form.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { Criteria, CriteriaCondition, CriteriaField, CriteriaValue } from 'src/app/models/criteria';
import { Gender } from 'src/app/models/beneficiary';


@Component({
    selector: 'app-modal-add-criteria',
    templateUrl: './modal-add-criteria.component.html',
    styleUrls: [ '../modal-fields/modal-fields.component.scss', './modal-add-criteria.component.scss' ],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ],
})
export class ModalAddCriteriaComponent implements OnInit {
    public criteria: Criteria;
    public fields: string[];
    public form: FormGroup;
    public displayWeight = false;
    public iconAdvanced = 'arrow_drop_down';

   // Language
   public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    private genders = [
        new Gender('0', this.language.add_distribution_female),
        new Gender('1', this.language.add_distribution_male)
    ];

    constructor(
        private criteriaService: CriteriaService,
        public modalReference: MatDialogRef<any>,
        private snackbar: SnackbarService,
        public formService: FormService,
        public languageService: LanguageService,
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
            const field = this.criteria.fields[fieldName];
            const validators = this.formService.getFieldValidators(field.isRequired, field.pattern);
            formControls[fieldName] = new FormControl(
                {
                    value: this.criteria.get(fieldName),
                    disabled: field.isDisabled
                },
                validators
            );
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
        this.criteria.set(
            'condition',
            this.criteria.getOptions('condition').filter((option: CriteriaCondition) => {
                return option.get('name') === this.form.controls.condition.value;
            })[0]
        );
        const value = this.form.controls.value.value;
        if (this.form.controls.field.value === 'gender') {
            const genderValue = this.genders.filter((gender: Gender) => gender.get('id') === value)[0];
            this.criteria.set('value', new CriteriaValue(value, genderValue.get('name')));
        }
        // In case the criteria is the dateOfBirth
        else if (value instanceof Date) {
            const datePipe = new DatePipe('en-US');
            const formattedValue = datePipe.transform(value, 'yyyy-MM-dd');
            this.criteria.set('value', new CriteriaValue(formattedValue, formattedValue));
        } else {
            this.criteria.set('value', new CriteriaValue(value, value));
        }
        this.criteria.set('weight', this.form.controls.weight.value);

        // get the information about the field with the selected field name
        this.criteria.getOptions('field').forEach((option: CriteriaField) => {
            if (option.get('field') === this.form.controls.field.value) {
                this.criteria.set('kindOfBeneficiary', option.get('kindOfBeneficiary'));
                this.criteria.set('tableString', option.get('tableString'));
                this.criteria.set('type', option.get('type'));
                this.criteria.set('field', option);
            }
        });

        if (
            (this.form.controls.field.value === 'gender' ||
                this.form.controls.field.value === 'dateOfBirth' ||
                this.form.controls.field.value === 'IDPoor' ||
                this.form.controls.field.value === 'equityCardNo') &&
            !this.form.controls.value.value
        ) {
            this.snackbar.error(this.language.modal_add_no_value);
        } else {
            this.modalReference.close(this.criteria);
        }
    }
}
