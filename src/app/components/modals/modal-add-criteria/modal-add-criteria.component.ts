import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { CriteriaService } from 'src/app/core/api/criteria.service';
import { FieldService } from 'src/app/core/api/field.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { Criteria, CriteriaCondition, CriteriaField } from 'src/app/model/criteria.new';
import { LanguageService } from './../../../../texts/language.service';


@Component({
    selector: 'app-modal-add-criteria',
    templateUrl: './modal-add-criteria.component.html',
    styleUrls: [ '../modal-fields/modal-fields.component.scss', './modal-add-criteria.component.scss' ]
})
export class ModalAddCriteriaComponent implements OnInit {
    public criteria: Criteria;
    public fields: string[];
    public form: FormGroup;
    public displayWeight = false;
    public iconAdvanced = 'arrow_drop_down';

   // Language
   public language = this.languageService.selectedLanguage;

    constructor(
        private criteriaService: CriteriaService,
        public modalReference: MatDialogRef<any>,
        private snackbar: SnackbarService,
        public fieldService: FieldService,
        private languageService: LanguageService,
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
            const validators = this.fieldService.getFieldValidators(field.isRequired, field.pattern);
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
        this.criteria.set('value', this.form.controls.value.value);
        this.criteria.set('weight', this.form.controls.weight.value);

        // In case the criteria is the dateOfBirth
        if (this.form.controls.value.value instanceof Date) {
            const datePipe = new DatePipe('en-US');
            this.criteria.set('value', datePipe.transform(this.form.controls.value.value, 'yyyy-MM-dd'));
        }

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
