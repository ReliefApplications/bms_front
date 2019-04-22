import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  constructor() { }

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
}
