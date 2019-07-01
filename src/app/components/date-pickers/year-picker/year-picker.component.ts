import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { DatePickerComponent } from '../date-picker/date-picker.component';

// Please look at https://stackoverflow.com/questions/49569854/mat-date-formats-definition-meaning-of-fields for more info
const YEAR_DATE_FORMATS = {
    parse: {
        dateInput: 'year'
    },
    display: {
        // dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
        dateInput: 'year',
        // monthYearLabel: { month: 'short', year: 'numeric', day: 'numeric' },
        monthYearLabel: 'year',
        dateA11yLabel: 'year',
        monthYearA11yLabel: 'year',
    }
};

@Component({
    selector: 'app-year-picker',
    templateUrl: '../date-picker/date-picker.component.html',
    styleUrls: ['../date-picker/date-picker.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: YEAR_DATE_FORMATS }
    ],
})
export class YearPickerComponent extends DatePickerComponent implements OnInit {

    startView = 'multi-year';

    onSelectedYear(date: Date) {
        this.pickerControl.setValue(date);
        this.datePicker.close();
    }
}
