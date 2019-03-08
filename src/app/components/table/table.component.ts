import { Component, OnInit, Input, ViewChild, OnChanges, ElementRef, DoCheck, Output, EventEmitter } from '@angular/core';
import {
    MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, Sort, MatTableDataSource,
    MatPaginator, MatPaginatorIntl, PageEvent, MatProgressSpinner
} from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';

import { Mapper } from '../../core/utils/mapper.service';

import { ModalDetailsComponent } from '../modals/modal-details/modal-details.component';
import { ModalComponent } from '../modals/modal.component';
import { ModalUpdateComponent } from '../modals/modal-update/modal-update.component';
import { ModalDeleteComponent } from '../modals/modal-delete/modal-delete.component';

import { GlobalText } from '../../../texts/global';
import { dashCaseToCamelCase } from '@angular/animations/browser/src/util';
import { Beneficiaries } from '../../model/beneficiary';
import { id } from '@swimlane/ngx-charts/release/utils';
import { DistributionData } from '../../model/distribution-data';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { WsseService } from '../../core/authentication/wsse.service';
import { DistributionService } from '../../core/api/distribution.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { LocationService } from 'src/app/core/api/location.service';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Households } from 'src/app/model/households';
import { NetworkService } from 'src/app/core/api/network.service';
import { Router } from '@angular/router';


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
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges, DoCheck {
    public table = GlobalText.TEXTS;
    public paginator: MatPaginator;
    public sort;

    @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
    }

    @ViewChild(MatSort) set content(content: ElementRef<MatSort>) {
        this.sort = content;
        if (this.sort && this.data) {
            this.data.sort = this.sort;
        }
    }

    // To activate/desactivate action buttons
    @Input() editable: boolean;
    // For Imported Beneficiaries
    @Input() parentId: number = null;
    // For Transaction Beneficiaries
    @Input() parentObject: any;

    @Input() totalLength;

    @Input() entity;
    public oldEntity;
    @Input() data: any;
    @Input() service;

    // To activate/desactivate action buttons
    @Input() rights: boolean;

    // To activate/desactivate action buttons
    @Input() rightsEdit: boolean;

    // To activate/desactivate action buttons
    @Input() rightsDelete: boolean;
    @Input() selection: any;
    @Output() selectChecked = new EventEmitter<any>();

    sortedData: any;
    allData: any = undefined;
    properties: any;
    propertiesTypes: any;
    propertiesActions: any;
    entityInstance = null;
    filled = true;

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
        public router: Router
    ) { }

    ngOnChanges() {
        if (this.data && this.data._data && this.data._data.value) {
            this.checkData();
        }
    }

    ngDoCheck() {
        if (this.data && this.data.data) {
            if (this.entity !== this.oldEntity) {
                this.checkData();
            }
            if (!this.data.paginator) {
                this.data.paginator = this.paginator;
            }
            if (this.table !== GlobalText.TEXTS) {
                this.table = GlobalText.TEXTS;
                this.setDataTableProperties();
                document.getElementsByClassName('mat-paginator-page-size-label')[0].innerHTML = this.table.table_items_per_page;
                document.getElementsByClassName('mat-paginator-range-label')[0].innerHTML =
                    this.rangeLabel(this.paginator.pageIndex, this.paginator.pageSize, this.paginator.length);
                this.mapperService.setMapperObject(this.entity);
            }
        }
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

    checkTable() {
        if (this.data && this.data.data && this.data.data.length > 0) {
            this.filled = true;
        } else {
            this.filled = false;
        }
    }

    updateData() {
        if (this.data.data) {
            if (this.entity.__classname__ === 'DistributionData') {
                this.distributionService.getByProject(this.data.data[0].project.id).subscribe(response => {
                    this.data = new MatTableDataSource(this.entity.formatArray(response));

                    this.setDataTableProperties();
                }, error => {
                    console.error('error', error);
                });
            } else if (this.entity.__classname__ === 'Beneficiaries') {
                this.distributionService.getBeneficiaries(this.parentId).subscribe(
                    response => {
                        this.data = new MatTableDataSource(Beneficiaries.formatArray(response));
                    }
                );
            } else if (this.entity.__classname__ === 'Households') {
                this.data.loadHouseholds(
                    this.data.filter,
                    {
                        sort: this.sort ? this.sort.active : null,
                        direction: this.sort ? this.sort.direction : null
                    },
                    this.paginator.pageIndex,
                    this.paginator.pageSize
                );
            } else {
                this.service.get().subscribe(response => {
                    this.data = new MatTableDataSource(this.entity.formatArray(response));
                });
            }
        }
    }

    setDataTableProperties() {
        if ((this.data && this.data._data && this.data._data.value) || (this.data && this.data.householdsSubject)) {
            this.data.sort = this.sort;
            if (this.paginator) {
                this.paginator._intl.itemsPerPageLabel = this.table.table_items_per_page;
                this.paginator._intl.firstPageLabel = this.table.table_first_page;
                this.paginator._intl.previousPageLabel = this.table.table_previous_page;
                this.paginator._intl.nextPageLabel = this.table.table_next_page;
                this.paginator._intl.lastPageLabel = this.table.table_last_page;
                this.paginator._intl.getRangeLabel = rangeLabel;
                this.data.paginator = this.paginator;
            }
        }

    }


    checkData() {
        if (!this.data.data) {
            this.data.data = new MatTableDataSource([]);
        }
        this.setDataTableProperties();
        if (this.entity) {
            this.entityInstance = this.mapperService.instantiate(this.entity);
            this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
            this.propertiesTypes = this.entityInstance.getTypeProperties(this.entityInstance);
            this.propertiesActions = new Array();
            if (this.selection) {
                this.propertiesActions.push('check');
            }

            this.properties.forEach(element => {
                this.propertiesActions.push(element);
            });
            this.propertiesActions.push('actions');
            this.mapperService.setMapperObject(this.entity);
        }
        this.oldEntity = this.entity;
    }

    /**
     * Recover the right from the model
     * @param element
     */
    recoverRights(element) {
        if (element.rights) {
            const re = /\ /gi;
            element.rights = element.rights.replace(re, '');
            let finalRight;

            this.entityInstance.getAllRights().forEach(rights => {
                const value = Object.values(rights);
                if (value[0] === element.rights) {
                    finalRight = value[1];
                }
            });

            return finalRight;
        }
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action, element): void {
        let dialogRef;

        if (user_action === 'details') {
            dialogRef = this.dialog.open(ModalDetailsComponent, {
                data: { data: element, entity: this.entity, service: this.service, mapper: this.mapperService }
            });
        } else if (user_action === 'update') {
            dialogRef = this.dialog.open(ModalUpdateComponent, {
                data: { data: element, entity: this.entity, service: this.service, mapper: this.mapperService }
            });
        } else {
            dialogRef = this.dialog.open(ModalDeleteComponent, {
                data: { data: element, entity: this.entity, service: this.service, mapper: this.mapperService }
            });
        }

        let deleteElement = null;
        if (dialogRef.componentInstance.onDelete) {
            deleteElement = dialogRef.componentInstance.onDelete.subscribe(
                (data) => {
                    this.deleteElement(data);
                });
        }

        let updateElement = null;
        if (dialogRef.componentInstance.onUpdate) {
            updateElement = dialogRef.componentInstance.onUpdate.subscribe(
                (data) => {
                    this.updateElement(data);
                });
        }

        dialogRef.afterClosed().subscribe(result => {
            if (updateElement) {
                updateElement.unsubscribe();
            }
            if (deleteElement) {
                deleteElement.unsubscribe();
            }
        });
    }

    applyFilter(filterValue: any, category?: string, suppress?: boolean): void {
        if (suppress) {
            const index = this.data.filter.findIndex(function(value) {
                return value.category === category;
            });

            this.data.filter.splice(index, 1);
        } else {
            if (filterValue) {
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

                    const index = this.data.filter.findIndex(function(value) {
                        return value.category === category;
                    });

                    if (index >= 0) {
                        if (filterValue.length === 0 || filterValue === '') {
                            this.data.filter.splice(index, 1);
                        } else {
                            this.data.filter[index] = { filter: filterValue, category: category };
                        }
                    } else
                        if (filterValue.length !== 0 || filterValue !== '') {
                            this.data.filter.push({ filter: filterValue, category: category });
                        }

                } else {
                    filterValue = filterValue.trim(); // Remove whitespace
                    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
                    this.data.filter = filterValue;
                }
            } else {
                if (category && category === 'familyName') {
                    const index = this.data.filter.findIndex(function(value) {
                        return value.category === category;
                    });

                    this.data.filter.splice(index, 1);
                }
            }
        }
    }

    updateElement(updateElement) {
        updateElement = this.entity.formatForApi(updateElement);

        if (updateElement['rights'] === 'ROLE_PROJECT_MANAGER' || updateElement['rights'] === 'ROLE_PROJECT_OFFICER' ||
            updateElement['rights'] === 'ROLE_FIELD_OFFICER') {
            delete updateElement['country'];
        } else if (updateElement['rights'] === 'ROLE_REGIONAL_MANAGER' || updateElement['rights'] === 'ROLE_COUNTRY_MANAGER' ||
            updateElement['rights'] === 'ROLE_READ_ONLY') {
            delete updateElement['projects'];
        } else {
            delete updateElement['country'];
            delete updateElement['projects'];
        }

        if (this.entity.__classname__ === 'User' && updateElement) {
            if (updateElement['password'] && updateElement['password'].length > 0) {
                this.authenticationService.requestSalt(updateElement['username']).subscribe(response => {
                    if (response) {
                        const saltedPassword = this._wsseService.saltPassword(response['salt'], updateElement['password']);
                        updateElement['password'] = saltedPassword;

                        this.service.update(updateElement['id'], updateElement).subscribe(_ => {
                            this.updateData();
                        });
                    }
                });
            } else {
                this.service.update(updateElement['id'], updateElement).subscribe(response => {
                    this.updateData();
                });
            }
        } else if (this.entity.__classname__ === 'Financial Provider' && updateElement) {
            const salted = btoa(updateElement['password']);
            updateElement['password'] = salted;

            this.service.update(updateElement).subscribe(response => {
                this.snackbar.success(this.entity.__classname__ + this.table.table_element_updated);
                this.updateData();
            });
        } else {
            this.service.update(updateElement['id'], updateElement).subscribe(response => {
                this.updateData();
            });
        }
    }

    deleteElement(deleteElement: Object) {
        if (this.entity === Beneficiaries) {
            this.service.delete(deleteElement['id'], this.parentId).subscribe(response => {
                this.updateData();
            });
        } else if (this.entity.__classname__ === 'Households') {
            this.householdsService.delete(deleteElement['id']).subscribe(response => {
                this.updateData();
            });
        } else {
            this.service.delete(deleteElement['id']).subscribe(response => {
                this.updateData();
            });
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
        if (this.data.householdsSubject) {
            numRows = this.data.householdsSubject._value.length;
        } else {
            numRows = this.data.data.length;
        }

        return numSelected === numRows;
    }

    masterToggle() {
        if (this.data.householdsSubject) {
            if (this.isAllSelected()) {
                this.selection.clear();
            } else {
                this.data.householdsSubject._value.forEach(row => this.selection.select(row));
            }
        } else {
            if (this.isAllSelected()) {
                this.selection.clear();
            } else {
                this.data.data.forEach(row => {
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

}
