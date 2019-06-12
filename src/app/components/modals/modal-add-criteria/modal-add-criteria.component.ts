import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS } from '@angular/material';
import { CriteriaService } from 'src/app/core/api/criteria.service';
import { FormService } from 'src/app/core/utils/form.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { Criteria, CriteriaCondition, CriteriaValue } from 'src/app/models/criteria';
import { Gender, Beneficiary, ResidencyStatus } from 'src/app/models/beneficiary';
import { LIVELIHOOD } from 'src/app/models/constants/livelihood';
import { Livelihood } from 'src/app/models/household';
import { HouseholdLocation, HouseholdLocationType } from 'src/app/models/household-location';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-modal-add-criteria',
    templateUrl: './modal-add-criteria.component.html',
    styleUrls: [ '../modal-fields/modal-fields.component.scss', './modal-add-criteria.component.scss' ],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ],
})
export class ModalAddCriteriaComponent implements OnInit, OnDestroy {
    public criteria: Criteria;
    public fields: string[];
    public form: FormGroup;
    public displayWeight = false;
    public iconAdvanced = 'arrow_drop_down';

    criteriaList: Array<Criteria>;
    livelihoods: Array<Livelihood>;
    residencyStatuses: Array<ResidencyStatus>;
    locationTypes: Array<HouseholdLocationType>;
    criteriaSubList: Array<Criteria>;

    subscribers: Array<Subscription> = [];

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private criteriaService: CriteriaService,
        public modalReference: MatDialogRef<any>,
        private snackbar: SnackbarService,
        public formService: FormService,
        public languageService: LanguageService,
        ) {}

    ngOnInit() {
        this.fillOptions();
        this.criteria = new Criteria();
        this.fields = Object.keys(this.criteria.fields);
        this.makeForm();
        this.loadFields();
    }

    ngOnDestroy() {
        this.subscribers.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    /**
     * Fill the dropdown for the potential criteria values
     */
    fillOptions() {
        this.livelihoods = LIVELIHOOD.map(livelihood => new Livelihood(livelihood.id, this.language[livelihood.language_key]));
        const beneficiary = new Beneficiary();
        this.residencyStatuses = beneficiary.getOptions('residencyStatus');
        const householdLocation = new HouseholdLocation();
        this.locationTypes = householdLocation.getOptions('type');
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
        formControls['criteriaType'] = new FormControl();
        formControls['campName'] = new FormControl();
        this.form = new FormGroup(formControls);
    }

    onChanges(): void {
        this.subscribers.push(this.form.get('criteriaType').valueChanges.subscribe(value => {
            this.criteriaSubList = this.criteriaList.filter((criteria: Criteria) => {
                return criteria.get<string>('target') === value && criteria.get<string>('field') !== 'campName';
            });
            this.form.controls.field.setValue(null);
            this.form.controls.condition.setValue(null);
            this.form.controls.value.setValue(null);
        }));

        this.subscribers.push(this.form.get('field').valueChanges.subscribe(value => {
            this.loadConditions(value);
        }));
    }

    loadFields() {
        this.criteriaService.get().subscribe((criteria: any) => {
            if (criteria) {
                this.criteriaList = criteria.map((criterion: any) => Criteria.apiToModel(criterion));
                this.onChanges();
                this.form.controls.criteriaType.setValue('Beneficiary');
            }
        });
    }

    loadConditions(fieldName) {
        if (fieldName) {
            this.criteriaService.fillConditionOptions(this.criteria, fieldName);
        }
        this.form.controls.condition.setValue(null);
        this.form.controls.value.setValue(null);
    }

    // To know if the value input/select is gonna be displayed
    needsValue(field) {
        return ['gender', 'dateOfBirth', 'equityCardNo', 'IDPoor', 'headOfHouseholdDateOfBirth', 'headOfHouseholdGender', 'livelihood',
            'foodConsumptionScore', 'copingStrategiesIndex', 'numberDependents', 'incomeLevel',
            'residencyStatus', 'hasNotBeenInDistributionsSince', 'locationType', 'campName'].includes(field);
    }

    /**
   * Function to change the value of the displayWeight variable
   * and the icon used
   */
    changeDisplay() {
        this.displayWeight = !this.displayWeight;
        this.iconAdvanced = this.displayWeight ? 'arrow_drop_up' : 'arrow_drop_down';
    }

    onCancel() {
        this.modalReference.close();
    }

    onSubmit() {
        const controls = this.form.controls;
        // get the information about the field with the selected field name
        this.criteriaList.forEach((option: Criteria) => {
            let field = null;
            if (controls.field.value === 'locationType' && controls.value.value === 'camp' &&
                controls.condition.value === '=' && controls.campName.value) {
                field = option.get<string>('field') === 'campName' ? option : null;
            } else if (option.get('field') === controls.field.value) {
                field = option;
            }
            if (field) {
                this.criteria.set('target', option.get('target'))
                    .set('tableString', option.get('tableString'))
                    .set('type', option.get('type'))
                    .set('field', option.get('field'));
            }
        });

        if (controls.field.value === 'locationType' && controls.value.value === 'camp' &&
            controls.condition.value === '=' && controls.campName.value) {
            this.criteria.set('value',  new CriteriaValue(controls.campName.value, controls.campName.value))
                .set('condition',
                    this.criteria.getOptions('condition').filter((option: CriteriaCondition) => option.get<string>('name') === '=')[0]);
        } else {
            this.criteria.set('condition', this.criteria.getOptions('condition')
                .filter((option: CriteriaCondition) => option.get('name') === controls.condition.value)[0]);
            const value = controls.value.value;

            if (controls.field.value === 'gender' || controls.field.value === 'headOfHouseholdGender') {
                const genderValue = this.criteria.genders.filter((gender: Gender) => gender.get('id') === value)[0];
                this.criteria.set('value', new CriteriaValue(value, genderValue.get('name')));
            } else if (controls.field.value === 'livelihood') {
                const livelihoodValue = this.livelihoods.filter((livelihood: Livelihood) => livelihood.get('id') === value)[0];
                this.criteria.set('value', new CriteriaValue(value, livelihoodValue.get('name')));
            } else if (controls.field.value === 'residencyStatus') {
                const residencyStatusValue = this.residencyStatuses
                    .filter((residencyStatus: ResidencyStatus) => residencyStatus.get('id') === value)[0];
                this.criteria.set('value', new CriteriaValue(value, residencyStatusValue.get('name')));
            } else if (controls.field.value === 'locationType') {
                const locationTypeValue = this.locationTypes
                    .filter((locationType: HouseholdLocationType) => locationType.get('id') === value)[0];
                this.criteria.set('value', new CriteriaValue(value, locationTypeValue.get('name')));
            } else if (controls.field.value === 'incomeLevel') {
                this.criteria.set('value',
                    new CriteriaValue(value, this.language['household_income_level'][value.toString()][this.criteria.country]));
            }
            // In case the criteria is the dateOfBirth
            else if (value instanceof Date) {
                const datePipe = new DatePipe('en-US');
                const formattedValue = datePipe.transform(value, 'yyyy-MM-dd');
                this.criteria.set('value', new CriteriaValue(formattedValue, formattedValue));
            } else {
                this.criteria.set('value', new CriteriaValue(value, value));
            }
        }

        this.criteria.set('weight', controls.weight.value);

        if ((controls.field.value === 'gender' || controls.field.value === 'dateOfBirth' ||
            controls.field.value === 'IDPoor' || controls.field.value === 'equityCardNo') &&
            !controls.value.value) {
            this.snackbar.error(this.language.modal_add_no_value);
        } else {
            this.modalReference.close(this.criteria);
        }
    }
}
