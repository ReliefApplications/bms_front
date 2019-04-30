import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DateAdapter, MatDialog, MatPaginator, MatSort, MatTableDataSource, MAT_DATE_FORMATS } from '@angular/material';
import { Router } from '@angular/router';
import { CustomModelService } from 'src/app/core/api/custom-model.service';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { LocationService } from 'src/app/core/api/location.service';
import { NetworkService } from 'src/app/core/api/network.service';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/core/utils/date.adapter';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { TextModelField } from 'src/app/model/CustomModel/text-model-field';
import { LanguageService } from 'src/texts/language.service';
import { DistributionService } from '../../core/api/distribution.service';
import { ExportService } from '../../core/api/export.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { WsseService } from '../../core/authentication/wsse.service';


// Todo: is this necessary ?
// const rangeLabel = (page: number, pageSize: number, length: number) => {
//     const table = GlobalText.TEXTS;

//     if (length === 0 || pageSize === 0) { return `0 ` + table.table_of_page + ` ${length}`; }

//     length = Math.max(length, 0);

//     const startIndex = page * pageSize;

//     // If the start index exceeds the list length, do not try and fix the end index to the end.
//     const endIndex = startIndex < length ?
//         Math.min(startIndex + pageSize, length) :
//         startIndex + pageSize;

//     return `${startIndex + 1} - ${endIndex} ` + table.table_of_page + ` ${length}`;
// };

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class TableComponent implements OnInit,  AfterViewInit {
    public paginator: MatPaginator;
    public sort;

    @ViewChild(MatPaginator)
    set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
    }

    @ViewChild(MatSort)
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

    @Output() selectChecked = new EventEmitter<any>();

    @Output() openModal = new EventEmitter<object>();
    @Output() printOne = new EventEmitter<any>();
    @Output() assignOne = new EventEmitter<any>();

    sortedData: any;
    allData: any = undefined;
    displayProperties: any;
    propertiesTypes: any;
    propertiesActions: any;
    entityInstance = null;
    public user_action = '';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

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
        public _exportService: ExportService,
        public userService: UserService,
        private languageService: LanguageService,
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
                } else if (field.kindOfField === 'Date') {
                    value = field.value;
                } else {
                    value = field.value;
                }

                if (values.length > 0) {
                    let stringValue = '';
                    values.forEach(arrayValue => {
                        if (typeof(arrayValue) === 'number') {
                            stringValue += ' ' + arrayValue.toString();
                        } else if (typeof(arrayValue) === 'string') {
                            stringValue += ' ' + arrayValue;
                        }
                    });
                    return stringValue.toLowerCase();
                }

                if (typeof(value) === 'number') {
                    return value;
                }
                if (typeof(value) === 'string') {
                    return value.toLowerCase();
                }
    }



    setDataTableProperties() {
        if (this.searchable) {
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
                    const value = typeof(this.getFieldStringValues(field)) === 'string' ?
                        this.getFieldStringValues(field) :
                        this.getFieldStringValues(field).toString();
                    fieldStringValues.push(value);
                });

                let containsFilter = false;

                fieldStringValues.forEach((value: string) => {
                    if (value.toLowerCase().includes(filter)) {
                        containsFilter = true;
                    }
                });
                return containsFilter;
            };
        }

        this.tableData.sortingDataAccessor = (item, property) => {
            let field = item.fields[property];

            if (field.kindOfField === 'Children') {
                field = item.get(field.childrenObject) ?
                    item.get(field.childrenObject).fields[field.childrenFieldName] :
                    new TextModelField({});
            }
            return this.getFieldStringValues(field);
        };

        if ((this.tableData && this.tableData.data)) {
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
        if (this.selectable) {
            return this.displayProperties ? ['check', ...this.displayProperties, 'actions'] : [];
        }
        return this.displayProperties ? [...this.displayProperties, 'actions'] : [];
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

    requestLogs(element: any) {
        this.service.requestLogs(element.get('id')).toPromise()
            .then(
                () => { this.snackbar.success('Logs have been sent'); }
            )
            .catch(
                (e) => {
                    this.snackbar.error('Logs could not be sent');
                }
            );
    }
}
