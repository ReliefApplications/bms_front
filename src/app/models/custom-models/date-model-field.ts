import { CustomModelField } from './custom-model-field';
import { CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { DatePipe } from '@angular/common';
import { LOCALE_ID, Inject, NgModule } from '@angular/core';


export class DateModelField extends CustomModelField<Date> {
    kindOfField = 'Date';

    /**
     * Do we display the time in modals ?
     * @type boolean
     */
    displayTime: boolean;


    constructor(
        properties: object,
        ) {
        super(properties);
        this.displayTime              = properties['displayTime'];
    }

    public static formatFromApi(date): Date {
        if (!date) {
            return null;
        }
        const splittedDate = date.split('-');
        const day = splittedDate[0];
        const month = splittedDate[1];
        const year = splittedDate[2];
        const formattedDate = new Date(year, month - 1, day); // month starts at 0
        return formattedDate;
    }

    public static formatDateTimeFromApi(date): Date {
        if (!date) {
            return null;
        }
        const splittedDate = date.split(' ');
        const dateWithoutTime = splittedDate[0].split('-');
        const time = splittedDate[1].split(':');
        const day = dateWithoutTime[0];
        const month = dateWithoutTime[1];
        const year = dateWithoutTime[2];
        const hour = time[0];
        const minute = time[1];
        const formattedDate = new Date(year, month - 1, day, hour, minute, 0, 0); // month starts at 0
        return formattedDate;
    }

    formatForApi(): any {
        const datePipe = new DatePipe('en-US');
        return datePipe.transform(this.value, 'dd-MM-yyyy');
    }
}
