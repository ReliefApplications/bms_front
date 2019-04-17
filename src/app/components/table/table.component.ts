import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DateAdapter, MatDialog, MatPaginator, MatSort, MAT_DATE_FORMATS } from '@angular/material';
import { Router } from '@angular/router';
import { CustomModelService } from 'src/app/core/api/custom-model.service';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { LocationService } from 'src/app/core/api/location.service';
import { NetworkService } from 'src/app/core/api/network.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/core/utils/date.adapter';
import { Beneficiaries } from 'src/app/model/beneficiary';
import { GlobalText } from '../../../texts/global';
import { DistributionService } from '../../core/api/distribution.service';
import { ExportService } from '../../core/api/export.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { WsseService } from '../../core/authentication/wsse.service';
import { Mapper } from '../../core/utils/mapper.service';
import { DistributionData } from '../../model/distribution-data';


const rangeLabel = (page: number, pageSize: number, length: number) => {
    const table = GlobalText.TEXTS;

    if (length === 0 || pageSize === 0) { return `0 ` + table.table_of_page + ` ${length}`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} ` + table.table_of_page + ` ${length}`;
};

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class TableComponent implements OnInit {
    public table = GlobalText.TEXTS;
    public paginator: MatPaginator;
    public sort;

    @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
    }

    @ViewChild(MatSort) set content(content: ElementRef<MatSort>) {
        this.sort = content;
        if (this.sort && this.tableData) {
            this.tableData.sort = this.sort;
        }
    }

    // To activate/desactivate action buttons
    @Input() editable: boolean;
    @Input() deletable: boolean;
    @Input() validatable = false;
    @Input() updatable = false;
    @Input() printable: boolean;
    @Input() assignable: boolean;

    // For Imported Beneficiaries
    @Input() parentId: number = null;
    // For Transaction Beneficiaries
    @Input() parentObject: any;

    @Input() entity;

    public tableData: any;
    @Input()
    set data(value: any) {
        if (value) {
            this.tableData = value;
            this.checkData();
        }
    }




    @Input() service: CustomModelService;

    // To activate/desactivate action buttons
    @Input() rights: boolean;
    // To activate/desactivate action buttons
    @Input() rightsEdit: boolean;
    // To activate/desactivate action buttons
    @Input() rightsDelete: boolean;

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

    constructor(
        public mapperService: Mapper,
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
    ) { }

    ngOnInit(): void {
        this.checkData();
    }

    updateTable(data) {
        this.tableData = data;
        this.tableData = [...this.tableData];
    }

    checkEntityUpdateRights() {
        if (this.entity === Beneficiaries) {
            return false;
        } else {
            return true;
        }
    }

    checkItemStateRights(item: any) {
        if (item instanceof DistributionData) {
            if (item.validated) {
                return false;
            } else {
                return true;
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

    applyFilter(filterValue: any, category?: string, suppress?: boolean): void {
        if (suppress) {
            const index = this.tableData.filter.findIndex(function(value) {
                return value.category === category;
            });

            this.tableData.filter.splice(index, 1);
        } else {
            if (filterValue !== undefined) {
                if (category) {
                    if (category === 'familyName') {
                        if (filterValue.length !== 0 || filterValue !== '') {
                            filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
                            filterValue = filterValue.split(/[\s,]+/);
                            if (filterValue[filterValue.length - 1] === '') {
                                filterValue.pop();
                            }
                        }
                    }

                    if (category === 'locations') {
                        filterValue = filterValue.name;
                    }

                    const index = this.tableData.filter.findIndex(function(value) {
                        return value.category === category;
                    });

                    if (index >= 0) {
                        if (filterValue.length === 0 || filterValue === '') {
                            this.tableData.filter.splice(index, 1);
                        } else {
                            this.tableData.filter[index] = { filter: filterValue, category: category };
                        }
                    } else
                        if (filterValue.length !== 0 || filterValue !== '') {
                            this.tableData.filter.push({ filter: filterValue, category: category });
                        }

                } else {
                    filterValue = filterValue.trim(); // Remove whitespace
                    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
                    this.tableData.filter = filterValue;
                }
            } else {
                if (category && category === 'familyName') {
                    const index = this.tableData.filter.findIndex(function(value) {
                        return value.category === category;
                    });

                    this.tableData.filter.splice(index, 1);
                }
            }
        }
    }

    rangeLabel(page: number, pageSize: number, length: number) {
        const table = GlobalText.TEXTS;

        if (length === 0 || pageSize === 0) { return `0 ` + table.table_of_page + ` ${length}`; }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;

        return `${startIndex + 1} - ${endIndex} ` + table.table_of_page + ` ${length}`;
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        let numRows;
        if (this.tableData.householdsSubject) {
            numRows = this.tableData.householdsSubject._value.length;
        } else {
            numRows = this.tableData.data.length;
        }

        return numSelected === numRows;
    }

    masterToggle() {
        if (this.tableData.householdsSubject) {
            if (this.isAllSelected()) {
                this.selection.clear();
            } else {
                this.tableData.householdsSubject._value.forEach(row => this.selection.select(row));
            }
        } else {
            if (this.isAllSelected()) {
                this.selection.clear();
            } else {
                this.tableData.data.forEach(row => {
                    if (!row.used) {
                        this.selection.select(row);
                    }
                });
            }
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
}
