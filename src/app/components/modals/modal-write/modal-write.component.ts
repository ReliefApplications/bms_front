import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DIALOG_DATA } from '@angular/material';
import { APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { CustomModel as CustomModel } from 'src/app/model/CustomModel/custom-model';
import { CustomDateAdapter } from '../../../core/utils/date.adapter';


@Component({
  selector: 'app-modal-write',
  templateUrl: './modal-write.component.html',
  styleUrls: ['./modal-write.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
],
})
export class ModalWriteComponent implements OnInit {

    // The reactive form corresponding to the html form
    form: FormGroup;

    // Prototype of the class of the object we want to create
    objectInstance: CustomModel;
    // Name of the different fields of the class
    objectFields: string[];

    modalTitle = 'Default Modal Text';
    constructor(
        public modalReference: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}


    ngOnInit() {
        this.objectInstance = this.data.objectInstance;
        // Get all the fields keys of the object passed in objectInterface as string[]
        this.objectFields = Object.keys(this.objectInstance.fields);
        // Fill all select fields with options
        // Create the form
        this.makeForm();
    }

    makeForm() {
        const formControls = {};
        this.objectFields.forEach((fieldName: string) => {
            const field = this.objectInstance.fields[fieldName];
            const validators = this.getFieldValidators(field.isRequired, field.pattern);

            if (field.isMultipleSelect) {
                console.log(field.value);
                const selectedOptions = field.value.map(option => {
                    return option.fields.id.value;
                });
                formControls[fieldName] = new FormControl({
                    value: selectedOptions,
                    disabled: this.isDisabled(field)
                }, validators);
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

        for (const field of this.objectFields) {
            if (this.form.controls[field].value) {
                this.objectInstance.fields[field].value = this.form.controls[field].value;
            }
        }

        this.modalReference.close('Submit');
    }

    private getFieldValidators(required?: boolean, pattern?: RegExp): ValidatorFn[] {
        const validators: ValidatorFn[] = [];
        if (required) {
            validators.push(Validators.required);
        }
        if (pattern) {
            validators.push(Validators.pattern(pattern));
        }
        return validators;
    }

    type(value: any) {
        return typeof value;
    }

    isDisabled(field) {
        throw new Error('You must overwrite this function in other components');
    }
}
