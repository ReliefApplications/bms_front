import { Component } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { DatePickerComponent } from '../date-picker/date-picker.component';

const MONTH_DATE_FORMATS = {
    parse: {
        dateInput: 'month'
    },
    display: {
        // dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
        dateInput: 'month',
        // monthYearLabel: { month: 'short', year: 'numeric', day: 'numeric' },
        monthYearLabel: 'month',
        dateA11yLabel: 'month',
        monthYearA11yLabel: 'month',
    }
};

@Component({
    selector: 'app-month-picker',
    templateUrl: '../date-picker/date-picker.component.html',
    styleUrls: ['../date-picker/date-picker.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MONTH_DATE_FORMATS }
    ],
})
export class MonthPickerComponent extends DatePickerComponent {

        startView = 'multi-year';

    onSelectedMonth(date: Date) {
        this.pickerControl.setValue(date);
        this.datePicker.close();
    }
}
