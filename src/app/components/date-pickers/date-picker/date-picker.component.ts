import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { CustomDateAdapter } from 'src/app/core/utils/date.adapter';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss'],

})
export class DatePickerComponent implements OnInit {

    @Input() control: FormControl;
    @Input() placeholder: string;

    @ViewChild(MatDatepicker) datePicker: MatDatepicker<Date|string>;

    protected pickerControl: FormControl = new FormControl(undefined, Validators.required);

    startView = 'month';

    constructor (
        protected customDateAdapter: CustomDateAdapter,
    ) {}

    ngOnInit(): void {
        this.pickerControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap((_: any) => {
                this.control.setValue(this.pickerControl.value);
            })
        ).subscribe();
    }

    onSelectedMonth(event: any) {
        return;
    }

    onSelectedYear(event: any) {
        return;
    }
}
