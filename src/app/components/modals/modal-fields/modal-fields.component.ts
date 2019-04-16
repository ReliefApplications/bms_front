import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DIALOG_DATA } from '@angular/material';
import { APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { CustomModel as CustomModel } from 'src/app/model/CustomModel/custom-model';
import { CustomDateAdapter } from '../../../core/utils/date.adapter';
import { FieldService } from 'src/app/core/api/field.service';
import { TextModelField } from 'src/app/model/CustomModel/text-model-field';
import { CustomModelField } from 'src/app/model/CustomModel/custom-model-field';
import { GlobalText } from 'src/texts/global';
import { UploadService } from 'src/app/core/api/upload.service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

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
    public texts = GlobalText.TEXTS;

    modalType: string = null;

    // Prototype of the class of the object we want to create
    objectInstance: CustomModel;
    // Name of the different fields of the class
    objectFields: string[];

    filename: string;

    modalTitle = 'Default Modal Text';
    constructor(
        public modalReference: MatDialogRef<any>,
        public fieldService: FieldService,
        public uploadService: UploadService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}


    ngOnInit() {
        this.objectInstance = this.data.objectInstance;
        // Get all the fields keys of the object passed in objectInterface as string[]
        this.objectFields = Object.keys(this.objectInstance.fields);
        // Create the form
        this.makeForm();
        this.onChanges();
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
                const selectedOptions =
                    field.value ?
                    field.value.map(option => {
                        return option.get('id');
                    }) :
                    null;
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

    onChanges(): void {
        const triggeringFieldsNames = this.objectFields.filter((fieldName) => this.objectInstance.fields[fieldName].isTrigger === true);
        triggeringFieldsNames.forEach((fieldName) => {
            this.form.get(fieldName).valueChanges.subscribe(value => {
                this.objectInstance = this.objectInstance.fields[fieldName].triggerFunction(this.objectInstance, value, this.form);
            });
        });
    }

    makeSelectFormControl(fieldName: string) {

    }

    makeOtherFormControl(fieldName: string) {

    }

    onCancel() {
        this.modalReference.close();
    }

    updateObjectFromForm() {
        // TODO: fix ngselect value that should make this code useles
        let subscription: Observable<string> = of(null);
        for (const fieldName of this.objectFields) {
            const field = this.objectInstance.fields[fieldName];
            if (field.kindOfField === 'Children') {
                if (this.form.controls[fieldName].value) {
                    const childrenField = this.objectInstance.get(field.childrenObject);
                    const childrenFieldName = field.childrenFieldName;
                    if (childrenField.fields[childrenFieldName].kindOfField === 'SingleSelect') {
                        childrenField.set(childrenFieldName, childrenField.getOptions(childrenFieldName).filter(option => {
                            return option.get('id') === this.form.controls[fieldName].value;
                        })[0]);
                    } else {
                        childrenField.set(childrenFieldName, this.form.controls[fieldName].value);
                    }
                    this.objectInstance.set(field.childrenObject, childrenField);
                }
            } else if (field.kindOfField === 'File') {
                if (this.form.controls[fieldName].value) {
                    subscription = this.uploadService
                        .uploadImage(this.form.controls[fieldName].value, field.uploadPath)
                        .pipe(
                            tap((fileUrl: string) => {
                                this.objectInstance.set(field.fileUrlField, fileUrl);
                            })
                        );
                }
            } else if (field.kindOfField === 'ArrayInputField') {
                const array = [];
                field.value.forEach((singleValue, index) => {
                    array.push(this.form.controls[fieldName + index.toString()].value);
                });
                this.objectInstance.set(fieldName, array);
            } else if (this.form.controls[fieldName].value && field.kindOfField === 'MultipleSelect') {
                this.objectInstance.set(fieldName, []);

                this.form.controls[fieldName].value.forEach(optionId => {
                    const selectedOption = this.objectInstance.getOptions(fieldName).filter(option => {
                        return option.get('id') === optionId;
                    })[0];

                    this.objectInstance.add(fieldName, selectedOption);
                });
            } else if (this.form.controls[fieldName].value && field.kindOfField === 'SingleSelect') {
                this.objectInstance.set(fieldName, this.objectInstance.getOptions(fieldName).filter(option => {
                    return option.get('id') === this.form.controls[fieldName].value;
                })[0]);
            } else if (this.form.controls[fieldName].value !== null && this.form.controls[fieldName].value !== undefined) {
                this.objectInstance.set(fieldName, this.form.controls[fieldName].value);
            }
        }
        return subscription;
    }

    // Create a new object from the form's data and emit it to its parent component
    onSubmit() {
        this.updateObjectFromForm().subscribe(() => {
            this.modalReference.close(this.modalType);
        });
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

    onFileChange(property, event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.filename = file.name;

            const formData = new FormData();
            formData.append('file', file);
            const fileField = this.objectFields
                .filter((fieldName: string) => this.objectInstance.fields[fieldName].kindOfField === 'File')[0];
            this.form.controls[fileField].setValue(formData);
        }
    }
}
