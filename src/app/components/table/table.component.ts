import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { LocationService } from 'src/app/core/api/location.service';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { NetworkService } from 'src/app/core/network/network.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { CustomModelService } from 'src/app/core/utils/custom-model.service';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { TextModelField } from 'src/app/models/custom-models/text-model-field';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { DistributionService } from '../../core/api/distribution.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { WsseService } from '../../core/authentication/wsse.service';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class TableComponent implements OnInit, AfterViewInit {
    public paginator: MatPaginator;
    public sort;

    @ViewChild(MatPaginator, { static: false })
    set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
        this.initPaginator();
    }

    @ViewChild(MatSort, { static: false })
    set content(content: ElementRef<MatSort>) {
        this.sort = content;
        if (this.sort && this.tableData) {
            this.tableData.sort = this.sort;
        }
    }

    // To activate/desactivate action buttons
    @Input() loggable = false;
    @Input() editable = false;
    @Input() deletable = false;
    @Input() validatable = false;
    @Input() updatable = false;
    @Input() printable = false;
    @Input() assignable = false;
    @Input() justifiable = false;
    @Input() duplicable = false;

    @Input() searchable = false;
    @Input() paginable = false;
    @Input() selectable = false;

    // For Imported Beneficiaries
    @Input() parentId: number = null;
    // For Transaction Beneficiaries
    @Input() parentObject: any;

    @Input() entity;

    public tableData: MatTableDataSource<any>;

    @Input()
    set data(value: any) {
        if (value) {
            this.tableData = value;
            this.checkData();
            this.setDataTableProperties();
        }
    }

    @Input() service: CustomModelService;
    @Input() selection: any;

    @Input() isLoading: boolean;

    @Output() selectChecked = new EventEmitter<any>();

    @Output() openModal = new EventEmitter<object>();
    @Output() printOne = new EventEmitter<any>();
    @Output() assignOne = new EventEmitter<any>();
    @Output() justifyOne = new EventEmitter<any>();
    @Output() duplicateOne = new EventEmitter<any>();

    sortedData: any;
    allData: any = undefined;
    displayProperties: any;
    propertiesTypes: any;
    propertiesActions: any;
    entityInstance = null;
    public user_action = '';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public dialog: MatDialog,
        public _cacheService: AsyncacheService,
        public snackbar: SnackbarService,
        public authenticationService: AuthenticationService,
        public _wsseService: WsseService,
        public financialProviderService: FinancialProviderService,
        public distributionService: DistributionService,
        public locationService: LocationService,
        public householdsService: HouseholdsService,
        public networkService: NetworkService,
        public router: Router,
        public userService: UserService,
        public languageService: LanguageService,
    ) { }

    ngOnInit(): void {
        this.checkData();
    }
    // Get the string displayed for each element property to filter/sort according to this string
    ngAfterViewInit() {
        this.setDataTableProperties();
    }


    getFieldStringValues(field: any): any {
        let value: any = '';
        let values = [];
        if (
            ['Object', 'MultipleObject'].includes(field.kindOfField) &&
            field.displayTableFunction &&
            field.displayTableFunction(field.value) &&
            !(field.displayTableFunction(field.value) instanceof Array)
        ) {
            value = field.displayTableFunction(field.value);
        } else if (field.kindOfField === 'MultipleObject') {
            values = field.value && field.displayTableFunction ? field.displayTableFunction(field.value) : [];
        } else if (field.kindOfField === 'MultipleSelect') {
            values = field.value.map((selectValue: CustomModel) => {
                return selectValue ? selectValue.get<string>(field.bindField) : '';
            });
        } else if (field.kindOfField === 'SingleSelect') {
            value = field.value ? field.value.get(field.bindField) : '';
        } else {
            value = field.value;
        }

        if (values.length > 0) {
            let stringValue = '';
            values.forEach(arrayValue => {
                if (typeof (arrayValue) === 'number') {
                    stringValue += ' ' + arrayValue.toString();
                } else if (typeof (arrayValue) === 'string') {
                    stringValue += ' ' + arrayValue;
                }
            });
            return stringValue.toLowerCase();
        }

        if (!isNaN(Number(value))) {
            return Number(value);
        }

        // If it is a number or a date
        if (typeof (value) === 'number' || typeof (value) === 'object') {
            return value;
        }
        if (typeof (value) === 'string') {
            return value.toLowerCase();
        }
    }



    setDataTableProperties() {
        if (this.searchable && this.tableData) {
            this.tableData.filterPredicate = (element: CustomModel, filter: string) => {
                if (!filter) {
                    return true;
                }

                const fieldStringValues = [];
                this.displayProperties.forEach((property: string) => {
                    let field = element.fields[property];

                    if (field.kindOfField === 'Children') {
                        field = element.get(field.childrenObject) ?
                            element.get(field.childrenObject).fields[field.childrenFieldName] :
                            new TextModelField({});
                    }
                    let stringValue = this.getFieldStringValues(field);

                    // For searching we need to have the date in format 12-03-1996 but for sorting it needs to stay a date
                    if (field.kindOfField === 'Date') {
                        stringValue = field.formatForApi();
                    }
                    const value = typeof (stringValue) === 'string' || !stringValue ? stringValue : stringValue.toString();
                    fieldStringValues.push(value);
                });

                let containsFilter = false;

                fieldStringValues.forEach((value: string) => {
                    if (value && value.toLowerCase().includes(filter)) {
                        containsFilter = true;
                    }
                });
                return containsFilter;
            };
        }

        if (this.tableData) {
            this.tableData.sortingDataAccessor = (item, property) => {
                let field = item.fields[property];

                if (field.kindOfField === 'Children') {
                    field = item.get(field.childrenObject) ?
                        item.get(field.childrenObject).fields[field.childrenFieldName] :
                        new TextModelField({});
                }
                return this.getFieldStringValues(field);
            };
        }
    }

    initPaginator() {
        if ((this.tableData && this.tableData.data && this.tableData.data.length)) {
            this.tableData.sort = this.sort;
            if (this.paginator && this.paginable) {
                this.paginator._intl.itemsPerPageLabel = this.language.table_items_per_page;
                this.paginator._intl.firstPageLabel = this.language.table_first_page;
                this.paginator._intl.previousPageLabel = this.language.table_previous_page;
                this.paginator._intl.nextPageLabel = this.language.table_next_page;
                this.paginator._intl.lastPageLabel = this.language.table_last_page;
                this.paginator._intl.getRangeLabel = this.rangeLabel;
                this.tableData.paginator = this.paginator;
            }
        }
    }

    checkData() {
        this.entityInstance = null;
        this.entityInstance = new this.entity();

        const allProperties = Object.keys(this.entityInstance.fields);

        this.displayProperties = allProperties.filter(property => {
            return this.entityInstance.fields[property].isDisplayedInTable === true;
        });
    }

    public getDisplayedColumns(): string[] {
        const actionable = this.validatable || this.updatable || this.loggable ||
            this.editable || this.deletable || this.printable || this.assignable || this.justifiable || this.duplicable;
        if (this.selectable && actionable) {
            return this.displayProperties ? ['check', ...this.displayProperties, 'actions'] : [];
        } else if (this.selectable && !actionable) {
            return this.displayProperties ? ['check', ...this.displayProperties] : [];
        } else if (!this.selectable && actionable) {
            return this.displayProperties ? [...this.displayProperties, 'actions'] : [];
        }
        return this.displayProperties ? this.displayProperties : [];
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action, element): void {

        this.openModal.emit({
            action: user_action,
            element: element
        });
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.tableData.filter = filterValue;
    }

    rangeLabel(page: number, pageSize: number, length: number) {

        if (length === 0 || pageSize === 0) { return `0 / ${length}`; }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;

        return `${startIndex + 1} - ${endIndex} / ${length}`;
    }

    isAllSelected() {
        return this.selection.selected.length === this.tableData.data.length;
    }

    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.tableData.data.forEach(row => {
                this.selection.select(row);
            });
        }
        this.selectChecked.emit(this.selection.selected);
    }

    toggleCheck(element: any) {
        if (this.selection.selected.includes(element)) {
            this.selection.deselect(element);
            return;
        }
        this.selection.select(element);

    }

    selectCheck(event, element) {
        if (event.checked) {
            this.selection.select(element);
        } else {
            this.selection.deselect(element);
        }

        this.selectChecked.emit(this.selection.selected);
    }

    print(element) {
        this.printOne.emit(element);
    }

    assign(element) {
        this.assignOne.emit(element);
    }

    justify(element) {
        this.justifyOne.emit(element);
    }

    duplicate(element) {
        this.duplicateOne.emit(element);
    }

    requestLogs(element: any) {
        if (!element) {
            return;
        }
        this.service.requestLogs(element.get('id')).subscribe(
            () => { this.snackbar.success(this.language.table_logs_success); },
            (_error: any) => { this.snackbar.error(this.language.table_logs_error); }
        );
    }
}
