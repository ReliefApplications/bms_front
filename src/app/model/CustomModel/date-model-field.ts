import { CustomModelField } from './custom-model-field';
import { CustomDateAdapter } from 'src/app/core/utils/date.adapter';
import { DatePipe } from '@angular/common';
import { LOCALE_ID, Inject, NgModule } from '@angular/core';


export class DateModelField extends CustomModelField<Date> {
    kindOfField = 'Date';

    constructor(
        properties: object,
        ) {
        super(properties);
    }

    formatForApi(): any {
        const datePipe = new DatePipe('en-US');
        return datePipe.transform(this.value, 'yyyy-MM-dd');
    }
}
