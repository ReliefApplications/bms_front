import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { CustomModel as CustomModel } from 'src/app/model/custom-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-modal-add',
    templateUrl: './modal-add.component.html',
    styleUrls: ['../modal.component.scss', './modal-add.component.scss']
})
export class ModalAddComponent implements OnInit {

    // The reactive form corresponding to the html form
    form: FormGroup;

    // Prototype of the class of the object we want to create
    objectInstance: CustomModel;
    // Name of the different fields of the class
    objectFields: string[];

    constructor(
        public modalReference: MatDialogRef<ModalAddComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}


    ngOnInit() {
        this.objectInstance = this.data.objectInstance;
        // Get all the fields keys of the object passed in objectInterface as string[]
        this.objectFields = Object.keys(this.objectInstance.fields);
        // Create the form
        this.makeForm();
    }

    makeForm() {
        const formControls = {};
        this.objectFields.forEach(fieldName => {
            const field = this.objectInstance.fields[fieldName];
            const validators = this.getFieldValidators(field.isRequired, field.pattern);
            formControls[fieldName] = new FormControl(null, validators);
        });
        this.form = new FormGroup(formControls);
    }

    onExit() {
        this.modalReference.close();
    }

    // Create a new object from the form's data and emit it to its parent component
    onSubmit() {

        for (const field of this.objectFields) {
            this.objectInstance[field] = this.form.controls[field].value;
        }

        this.modalReference.close();
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

    // getSelectOptions(field) {
    //     this.customModelService.get(field).subscribe(options => {
    //         return options;
    //     });
    // }

    type(value: any) {
        return typeof value;
    }


}
