import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatPaginator, MatSort, MAT_DATE_FORMATS } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/core/utils/date.adapter';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { CustomDataSource } from 'src/app/model/data-source/custom-data-source.interface';
import { TableComponent } from '../table.component';

export interface Filter {
    category: string;
    filter: any;
}

@Component({
    selector: 'app-table-server',
    templateUrl: './table-server.component.html',
    styleUrls: ['./table-server.component.scss', '../table.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class TableServerComponent extends TableComponent implements OnInit, AfterViewInit {

    public tableServerData: CustomDataSource<any>;
    @Input()
    set data(value: any) {
        if (value) {
            this.tableServerData = value;
            this.checkData();
        }
    }

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    public filters: CustomModel;
    public filterFields: Array<string>;
    public filtersForm: FormGroup;

    public filtersForAPI: Array<Filter> = [];

    advancedResearch = false;

    public keyupTimeout: NodeJS.Timer;

    @Input() selectable = false;
    @Input() selection: any;

    @Output() selectChecked = new EventEmitter<any>();

    ngOnInit() {
    }

    ngAfterViewInit() {
        // define and get filters
        this.filters = this.tableServerData.getFilterFields();
        this.filterFields = Object.keys(this.filters.fields).filter(property => {
            return this.filters.fields[property].isDisplayedInTable === true;
        });
        this.createForm();
        this.listenToChanges();
        this.service.fillFiltersWithOptions(this.filters);
        // get data
        this.tableServerData.loadData([], { sort: null, direction: null }, 0, 10);

        if (this.sort) {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => this.loadDataPage())
                )
                .subscribe();
        }
    }

    loadDataPage() {
        this.tableServerData.loadData(
            this.filtersForAPI,
            {
                sort: this.sort ? this.sort.active : null,
                direction: this.sort ? this.sort.direction : null
            },
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    applySpecificFilter(filterValue: any, category: string) {
        if (typeof (filterValue) === 'string') {
            filterValue = filterValue.trim().toLowerCase();
        }

        if (category === 'any') {
            filterValue = filterValue.split(/[\s,]+/).filter((value: string) => {
                return value !== '';
            });
        }

        if (category === 'locations' && filterValue) {
            let existingValue = {};
            const existingLocation = this.filtersForAPI.find((element: Filter) => {
                return element.category === 'locations';
            });
            if (existingLocation !== undefined) {
                existingValue = existingLocation.filter;
            }
            existingValue[filterValue.child] = filterValue.value;

            filterValue = existingValue;
        }

        // if the filter already exists, remove it and add the new one
        const indexInFilter = this.filtersForAPI.findIndex((element: Filter) => {
            return element.category === category;
        });
        if (indexInFilter >= 0) {
            this.filtersForAPI.splice(indexInFilter, 1);
        }

        if (filterValue && filterValue.length !== 0) {
            this.filtersForAPI.push({
                category: category,
                filter: filterValue
            });
        }

        this.paginator.pageIndex = 0;

        // Wait until user has finished typing to send data
        clearTimeout(this.keyupTimeout);
        this.keyupTimeout = setTimeout(
            this.loadDataPage.bind(this), 500
        );
    }

    createForm() {
        const formControls = {};
        this.filterFields.forEach((fieldName: string) => {
            formControls[fieldName] = new FormControl();
        });

        this.filtersForm = new FormGroup(formControls);
    }

    display(field) {
        if (field.kindOfField === 'Children') {
            return this.filters.get(field.childrenObject).fields[field.childrenFieldName];
        } else {
            return field;
        }
    }

    listenToChanges() {
        this.filterFields.forEach((fieldName: string) => {
            this.filtersForm.get(fieldName).valueChanges.subscribe((value) => {
                const field = this.filters.fields[fieldName];
                // Change filters and form according to changes
                if (value && field.isTrigger) {
                    this.filters = field.triggerFunction(this.filters, value, this.filtersForm);
                }

                // Format values
                let formattedValue = value;
                if (value && field.kindOfField === 'Children') {
                    const childrenFieldName = field.childrenFieldName;
                    formattedValue = {
                        child: childrenFieldName,
                        value: value
                    };
                }

                this.applySpecificFilter(formattedValue, field.filterName);
            });
        });
    }

    showAdvancedResearch() {
        this.advancedResearch = !this.advancedResearch;
    }

    clearSearch() {
        this.filterFields.forEach((fieldName: string) => {
            this.filtersForm.controls[fieldName].setValue(null);
        });
    }

    isAllSelected() {
        return this.selection.selected.length === this.tableServerData.dataSubject.value.length;
    }

    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.tableServerData.dataSubject.value.forEach(row => this.selection.select(row));
        }
        this.selectChecked.emit(this.selection.selected);
    }

    selectCheck(event, element) {
        if (event.checked) {
            this.selection.select(element);
        } else {
            this.selection.deselect(element);
        }

        this.selectChecked.emit(this.selection.selected);
    }

}
