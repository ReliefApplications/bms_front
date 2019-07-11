import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { CustomModelField } from 'src/app/models/custom-models/custom-model-field';
import { Location } from '../../models/location';
import { LocationService } from '../api/location.service';
import { CountriesService } from '../countries/countries.service';
@Injectable({
  providedIn: 'root'
})
export class FormService {

    form: FormGroup;

  constructor(
    public locationService: LocationService,
    public countryService: CountriesService,
  ) { }

    // To see if a value is null, undefined, empty.... Warning, 0 and false must be real values
    isEmpty(field, type) {
        if (field.isPassword) {
            return false;
        }
        const value = field.value;
        if (field.kindOfField === 'Object' || field.kindOfField === 'MultipleObject') {
            const displayedValue = type === 'modal' ? field.displayModalFunction(field.value) : field.displayTableFunction(field.value);
            if (!(displayedValue instanceof Array)) {
                return displayedValue === null || displayedValue === undefined || displayedValue === '';
            } else {
                const notEmptyValue = displayedValue.filter(singleValue => {
                    return singleValue !== null && singleValue !== undefined && singleValue !== '' && singleValue !== [];
                });
                return notEmptyValue.length === 0;
            }
        } else if (field.kindOfField === 'SingleSelect' || field.kindOfField === 'MultipleSelect') {
            if (!(value instanceof Array)) {
                return value === null || value === undefined || value === '' || !value.get(field.bindField);
            } else {
                const notEmptyValue = value.filter(singleValue => {
                    return singleValue.get(field.bindField);
                });
                return notEmptyValue.length === 0;
            }
        } else if (value instanceof Array) {
            const notEmptyValue = value.filter(singleValue => {
                return singleValue !== null || singleValue !== undefined || singleValue !== '';
            });
            return notEmptyValue.length === 0;
        } else {
            return value === null || value === undefined || value === '';
        }
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

    public makeForm(objectInstance: CustomModel, objectFields: Array<string>, modalType: string): FormGroup {
        const formControls = {};
        objectFields.forEach((fieldName: string) => {
            const field = objectInstance.fields[fieldName];
            const validators = this.getFieldValidators(field.isRequired, field.pattern);

            if (field.kindOfField === 'MultipleSelect') {
                // TODO: type this
                const selectedOptions =
                    field.value ?
                    field.value.map(option => {
                        return option.get(field.apiLabel);
                    }) :
                    null;
                formControls[fieldName] = new FormControl({
                    value: selectedOptions,
                    disabled: this.isDisabled(field, modalType)
                }, validators);
            } else if (field.kindOfField === 'SingleSelect') {
                formControls[fieldName] = new FormControl({
                    value: field.value ? field.value.get(field.apiLabel) : null,
                    disabled: this.isDisabled(field, modalType)
                }, validators);
            } else if (field.kindOfField === 'Children') {
                let value = null;
                if (!field.isPassword) {
                    if (field.childrenFieldName === 'adm1') {
                        this.initLocation(objectInstance);
                    } else if (
                        field.childrenFieldName === 'adm2' || field.childrenFieldName === 'adm3' || field.childrenFieldName === 'adm4') {
                        // Do nothing because it was initialized the line before
                    } else {
                        const childrenField = objectInstance.get(field.childrenObject);
                        const childrenFieldName = field.childrenFieldName;
                        if (childrenField && childrenField.fields[childrenFieldName].kindOfField === 'SingleSelect') {
                            value = childrenField.get(childrenFieldName) ? childrenField.get(childrenFieldName).get('id') : null;
                        } else {
                            value =  childrenField ? childrenField.get(childrenFieldName) : null;
                        }
                    }
                }

                formControls[fieldName] = new FormControl({
                    value: value,
                    disabled: this.isDisabled(field, modalType)
                }, validators);
            } else if (field.kindOfField === 'ArrayInputField') {
                field.value.forEach((singleValue, index) => {
                    formControls[fieldName + index.toString()] = new FormControl({
                        value: singleValue,
                        disabled: this.isDisabled(field, modalType)
                    }, validators);
                });
            } else {
                let value = field.value;
                if (field.isPassword) {
                    value = null;
                }
                // Create field's form control
                formControls[fieldName] = new FormControl({
                    value: value,
                    disabled: this.isDisabled(field, modalType)
                }, validators);
            }
        });

        this.form = new FormGroup(formControls);

        return this.form;
    }

    public isDisabled(field: CustomModelField<any>, modalType) {
        if (modalType === 'Add') {
            return field.isDisabled;
        } else if (modalType === 'Edit') {
            return !field.isEditable;
        } else if (modalType === 'Details') {
            return true;
        } else {
            return false;
        }
    }

    initLocation(object: CustomModel) {
        const location = object.get<Location>('location');
        this.locationService.fillAdm1Options(location).subscribe((filledLocationAdm1: Location) => {
            if (!object.get('location').get('adm1') || !object.get('location').get('adm1').get('id')) {
                object.set('location', filledLocationAdm1);
                return;
            }
            const adm1Id = object.get('location').get('adm1').get<number>('id');
            this.form.controls['adm1'].setValue(adm1Id);
            this.locationService.fillAdm2Options(filledLocationAdm1, adm1Id).subscribe((filledLocationAdm2: Location) => {
                if (!object.get('location').get('adm2') || !object.get('location').get('adm2').get('id')) {
                    object.set('location', filledLocationAdm2);
                    return;
                }
                const adm2Id = object.get('location').get('adm2').get<number>('id');
                this.form.controls['adm2'].setValue(adm2Id);
                this.locationService.fillAdm3Options(filledLocationAdm2, adm2Id).subscribe((filledLocationAdm3: Location) => {
                    if (!object.get('location').get('adm3') || !object.get('location').get('adm3').get('id')) {
                        object.set('location', filledLocationAdm3);
                        return;
                    }
                    const adm3Id = object.get('location').get('adm3').get<number>('id');
                    this.form.controls['adm3'].setValue(adm3Id);
                    this.locationService.fillAdm4Options(filledLocationAdm3, adm3Id).subscribe((filledLocationAdm4: Location) => {
                        object.set('location', filledLocationAdm4);
                        if (!object.get('location').get('adm4')) {
                            return;
                        }
                        this.form.controls['adm4'].setValue(object.get('location').get('adm4').get('id'));
                    });
                });
            });
        });
    }

    getLocalCurrency(): string {
        let localCurrency = 'USD';
        const countryId = this.countryService.selectedCountry.get<string>('id') ?
            this.countryService.selectedCountry.get<string>('id') :
            null;
        if (countryId === 'SYR') {
            localCurrency = 'SYP';
        } else if (countryId === 'KHM') {
            localCurrency = 'KHR';
        }
        return localCurrency;
    }

    pushLocalCurrencyOnTop(currencies: any, localCurrency: string): any {
        // There we pull the local currency from the list to put it on top of it
        let currencyId: string;
        const indexInFilter = currencies.findIndex((element: any) => {
            if (element.name === localCurrency) {
                currencyId = element.id;
                return true;
            } else {
                return false;
            }
        });
        if (indexInFilter >= 0) {
            currencies.splice(indexInFilter, 1);
            currencies.unshift({ id: currencyId, name: localCurrency });
        }

        return currencies;
    }
}
