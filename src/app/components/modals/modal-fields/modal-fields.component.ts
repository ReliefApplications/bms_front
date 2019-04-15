import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DIALOG_DATA } from '@angular/material';
import { APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { CustomModel as CustomModel } from 'src/app/model/CustomModel/custom-model';
import { CustomDateAdapter } from '../../../core/utils/date.adapter';
import { FieldService } from 'src/app/core/api/field.service';

@Component({
    selector: 'app-project',
    templateUrl: './modal-fields.component.html',
    styleUrls: ['./modal-fields.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ],
})
export class ModalFieldsComponent implements OnInit {

    // The reactive form corresponding to the html form
    form: FormGroup;

    modalType: string = null;

    // Prototype of the class of the object we want to create
    objectInstance: CustomModel;
    // Name of the different fields of the class
    objectFields: string[];

    modalTitle = 'Default Modal Text';
    constructor(
        public modalReference: MatDialogRef<any>,
        public fieldService: FieldService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}


    ngOnInit() {
        this.objectInstance = this.data.objectInstance;
        // Get all the fields keys of the object passed in objectInterface as string[]
        this.objectFields = Object.keys(this.objectInstance.fields);
        // Create the form
        this.makeForm();
    }

    display(field) {
        if (field.kindOfField === 'Children') {
            return this.objectInstance.get(field.childrenObject).fields[field.childrenFieldName];
        } else {
            return field;
        }
    }

    // To see if a value is null, undefined, empty....
    isEmpty(field) {
       return this.fieldService.isEmpty(field, 'modal');
    }

    makeForm() {
        const formControls = {};
        this.objectFields.forEach((fieldName: string) => {
            const field = this.objectInstance.fields[fieldName];
            const validators = this.getFieldValidators(field.isRequired, field.pattern);

            if (field.kindOfField === 'MultipleSelect') {
                // TODO: type this
                const selectedOptions = field.value.map(option => {
                    return option.get('id');
                });
                formControls[fieldName] = new FormControl({
                    value: selectedOptions,
                    disabled: this.isDisabled(field)
                }, validators);
            } else if (field.kindOfField === 'SingleSelect') {
                formControls[fieldName] = new FormControl({
                    value: field.value ? field.value.get('id') : null,
                    disabled: this.isDisabled(field)
                }, validators);
            } else if (field.kindOfField === 'Children') {
                formControls[fieldName] = new FormControl({
                    value: this.objectInstance.get(field.childrenObject) ?
                        this.objectInstance.get(field.childrenObject).get(field.childrenFieldName) :
                        null,
                    disabled: this.isDisabled(field)
                }, validators);
            } else if (field.kindOfField === 'ArrayInputField') {
                field.value.forEach((singleValue, index) => {
                    formControls[fieldName + index.toString()] = new FormControl({
                        value: singleValue,
                        disabled: this.isDisabled(field)
                    }, validators);
                });
            } else {
                // Create field's form control
                formControls[fieldName] = new FormControl({
                    value: field.value,
                    disabled: this.isDisabled(field)
                }, validators);
            }
        });

        this.form = new FormGroup(formControls);
    }

    makeSelectFormControl(fieldName: string) {

    }

    makeOtherFormControl(fieldName: string) {

    }

    onCancel() {
        this.modalReference.close();
    }

    // Create a new object from the form's data and emit it to its parent component
    onSubmit() {
        // TODO: fix ngselect value that should make this code useles
        for (const field of this.objectFields) {
            if (this.objectInstance.fields[field].kindOfField === 'ArrayInputField') {
                const array = [];
                this.objectInstance.fields[field].value.forEach((singleValue, index) => {
                    array.push(this.form.controls[field + index.toString()].value);
                });
                this.objectInstance.set(field, array);
            } else if (this.form.controls[field].value && this.objectInstance.fields[field].kindOfField === 'MultipleSelect') {
                this.objectInstance.set(field, []);

                this.form.controls[field].value.forEach(optionId => {
                    const selectedOption = this.objectInstance.getOptions(field).filter(option => {
                        return option.get('id') === optionId;
                    })[0];

                    this.objectInstance.add(field, selectedOption);
                });
            } else if (this.form.controls[field].value && this.objectInstance.fields[field].kindOfField === 'SingleSelect') {
                this.objectInstance.set(field, this.objectInstance.getOptions(field).filter(option => {
                    return option.get('id') === this.form.controls[field].value;
                })[0]);

            } else if (this.form.controls[field].value !== null && this.form.controls[field].value !== undefined) {
                this.objectInstance.set(field, this.form.controls[field].value);
            }

        }
        this.modalReference.close(this.modalType);
    }

    type(value: any) {
        return typeof value;
    }

    isDisabled(field) {
        throw new Error('You must override this function in other components');
    }

    getFieldValidators(required?: boolean, pattern?: RegExp): ValidatorFn[] {
        const validators: ValidatorFn[] = [];
        if (required) {
            validators.push(Validators.required);
        }
        if (pattern) {
            validators.push(Validators.pattern(pattern));
        }
        return validators;
    }
}
