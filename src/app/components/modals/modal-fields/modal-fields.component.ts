import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormService } from 'src/app/core/utils/form.service';
import { LocationService } from 'src/app/core/api/location.service';
import { UploadService } from 'src/app/core/api/upload.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { APP_DATE_FORMATS } from 'src/app/shared/adapters/date.adapter';
import { CustomModel as CustomModel } from 'src/app/models/custom-models/custom-model';
import { TextModelField } from 'src/app/models/custom-models/text-model-field';
import { CustomDateAdapter } from '../../../shared/adapters/date.adapter';
import { FONTS } from 'src/app/models/constants/fonts';
import { COLORS } from 'src/app/models/constants/colors';
import { CustomModelField } from 'src/app/models/custom-models/custom-model-field';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { FileModelField } from 'src/app/models/custom-models/file-model-field';
import { Location } from 'src/app/models/location';

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

    filename: string;
    fileError: boolean;

    modalTitle = 'Default Modal Text';

    private fonts: string[] = FONTS;
    private colors: string[] = COLORS;
    private colorModalRef;
    private currentColor: string;
    initialAdmValues: any;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public modalReference: MatDialogRef<any>,
        public formService: FormService,
        public uploadService: UploadService,
        public locationService: LocationService,
        public languageService: LanguageService,
        private dialog: MatDialog,
        private snackbar: SnackbarService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}


    ngOnInit() {
        this.objectInstance = this.data.objectInstance;
        // Get all the fields keys of the object passed in objectInterface as string[]
        if (this.modalType === 'Add') {
            this.objectFields = Object.keys(this.objectInstance.fields)
                .filter((fieldName: string) => this.objectInstance.fields[fieldName].isSettable);
        } else {
            this.objectFields = Object.keys(this.objectInstance.fields);
        }

        if (this.objectFields.includes('location') && !this.objectInstance.get('location')) {
            this.objectInstance.set('location', new Location);
        }

        if (this.objectInstance.get('location') && this.modalType !== 'Details') {
            this.initialAdmValues = {
                adm1: this.objectInstance.get('location').get('adm1') ? this.objectInstance.get('location').get('adm1').get('id') : null,
                adm2: this.objectInstance.get('location').get('adm2') ? this.objectInstance.get('location').get('adm2').get('id') : null,
                adm3: this.objectInstance.get('location').get('adm3') ? this.objectInstance.get('location').get('adm3').get('id') : null,
                adm4: this.objectInstance.get('location').get('adm4') ? this.objectInstance.get('location').get('adm4').get('id') : null
            };
        }

        // Create the form
        this.makeForm();
        this.onChanges();
    }

    display(field, fieldName) {
        if (this.modalType !== 'Details' &&
            (fieldName === 'adm1' || fieldName === 'adm2' || fieldName === 'adm3' || fieldName === 'adm4')
        ) {
            return false;
        } else if (this.modalType === 'Details' && fieldName === 'location') {
            return false;
        }
        if (field.kindOfField === 'Children') {
            return this.objectInstance.get(field.childrenObject) ?
                this.objectInstance.get(field.childrenObject).fields[field.childrenFieldName] :
                new TextModelField({
                    title: field.title,
                    isPassword: field.isPassword
                });
        } else {
            return field;
        }
    }

    // To see if a value is null, undefined, empty....
    isEmpty(field) {
       return this.formService.isEmpty(field, 'modal');
    }

    makeForm() {
        // The adms form controls will be created inside the adm-form component to avoid multiple api calls
        const filteredObjectFields = this.objectFields.filter((fieldName: string) =>
            this.modalType === 'Details' || (fieldName !== 'adm1' && fieldName !== 'adm2' && fieldName !== 'adm3' && fieldName !== 'adm4'));
        this.form = this.formService.makeForm(this.objectInstance, filteredObjectFields, this.modalType);
    }

    onChanges(): void {
        const triggeringFieldsNames = this.objectFields.filter((fieldName) => this.objectInstance.fields[fieldName].isTrigger === true);
        triggeringFieldsNames.forEach((fieldName) => {
            this.form.get(fieldName).valueChanges.subscribe(value => {
                this.objectInstance = this.objectInstance.fields[fieldName].triggerFunction(this.objectInstance, value, this.form);
            });
        });
        const multipleSelects = this.objectFields.filter((fieldName) => {
            return this.objectInstance.fields[fieldName].kindOfField === 'MultipleSelect';
        });
        multipleSelects.forEach((fieldName) => {
            this.form.get(fieldName).valueChanges.subscribe(value => {
                if (this.objectInstance.fields[fieldName].maxSelectionLength &&
                    value.length > this.objectInstance.fields[fieldName].maxSelectionLength) {
                    value.shift();
                    this.form.controls[fieldName].setValue(value);
                }
            });
        });
    }

    onCancel() {
        this.modalReference.close();
    }

    updateObjectFromForm() {
        // TODO: fix ngselect value that should make this code useles
        let subscription: Observable<string> = of(null);
        for (const fieldName of this.objectFields) {
            const field = this.objectInstance.fields[fieldName];
            // To avoid problems when trying to access a field that doesn't exists (Edit distribution -> adms)
            if (this.form.controls[fieldName]) {
                // To prevent the update of encoding a null password
                if (field.isPassword && !this.form.controls[fieldName].value) {
                    this.objectInstance.set(fieldName, null);
                    if (field.kindOfField === 'Children') {
                        const childrenField = this.objectInstance.get(field.childrenObject);
                        const childrenFieldName = field.childrenFieldName;
                        childrenField.set(childrenFieldName, null);
                    }
                } else if (field.kindOfField === 'Children') {
                    const childrenField = this.objectInstance.get(field.childrenObject);
                    const childrenFieldName = field.childrenFieldName;
                    if (this.form.controls[fieldName].value) {
                        if (childrenField.fields[childrenFieldName].kindOfField === 'SingleSelect') {
                            childrenField.set(childrenFieldName, childrenField.getOptions(childrenFieldName).filter(option => {
                                return option.get('id') === this.form.controls[fieldName].value;
                            })[0]);
                        } else {
                            childrenField.set(childrenFieldName, this.form.controls[fieldName].value);
                        }
                        this.objectInstance.set(field.childrenObject, childrenField);
                    } else {
                        childrenField.set(childrenFieldName, null);
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
                } else if (field.kindOfField === 'MultipleSelect') {
                    this.objectInstance.set(fieldName, []);
                    if (this.form.controls[fieldName].value) {
                        this.form.controls[fieldName].value.forEach(optionId => {
                            const selectedOption = this.objectInstance.getOptions(fieldName).filter(option => {
                                return option.get('id') === optionId;
                            })[0];
                            this.objectInstance.add(fieldName, selectedOption);
                        });
                    }
                } else if (field.kindOfField === 'Object' && fieldName === 'parameters') {
                    const parameters = {};
                    const controlKeys = Object.keys(this.form.controls);
                    const schemaKeys = Object.keys(this.objectInstance.get('parametersSchema'));
                    controlKeys.forEach((key) => {
                        if (schemaKeys.includes(key)) {
                            parameters[key] = this.form.controls[key].value;
                        }
                    });
                    this.objectInstance.set(fieldName, parameters);
                } else if (this.form.controls[fieldName].value && field.kindOfField === 'SingleSelect') {
                    this.objectInstance.set(fieldName, this.objectInstance.getOptions(fieldName).filter(option => {
                        return option.get('id') === this.form.controls[fieldName].value;
                    })[0]);
                } else if (this.form.controls[fieldName].value !== null && this.form.controls[fieldName].value !== undefined) {
                    this.objectInstance.set(fieldName, this.form.controls[fieldName].value);
                } else if (!this.form.controls.value) {
                    this.objectInstance.set(fieldName, null);
                }
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

    isDisabled(field): boolean {
        throw new Error('You must override this function in other components');
    }

    onFileChange(field: FileModelField, event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.filename = file.name;
            if (!field.acceptedTypes.includes(this.filename.split('.').pop())) {
                this.fileError = true;
            } else {
                this.fileError = false;
            }

            const formData = new FormData();
            formData.append('file', file);
            const fileField = this.objectFields
                .filter((fieldName: string) => this.objectInstance.fields[fieldName].kindOfField === 'File')[0];
            this.form.controls[fileField].setValue(formData);
        }
    }

    pickColor(template, fieldName: string, field: CustomModelField<any>) {
        if (!this.isDisabled(field)) {
            this.colorModalRef = this.dialog.open(template);
            this.currentColor = this.form.controls[fieldName].value;
            this.colorModalRef.afterClosed().subscribe((color: string) => {
                if (color) {
                    this.form.controls[fieldName].setValue(color);
                }
            });
        }
    }

    computeNumbers(i: number) {
        const k = i * 13;
        return [k, k + 1, k + 2, k + 3, k + 4, k + 5, k + 6, k + 7, k + 8, k + 9, k + 10, k + 11, k + 12];
    }

    onPick(color: string): any {
        this.colorModalRef.close(color);
    }
}
