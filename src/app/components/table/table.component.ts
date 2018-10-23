
import { Component, OnInit, Input, ViewChild, OnChanges, ElementRef, DoCheck } from '@angular/core';
import {
    MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, Sort, MatTableDataSource,
    MatPaginator, MatPaginatorIntl, PageEvent, MatProgressSpinner, MatSnackBar
} from '@angular/material';

import { Mapper } from '../../core/utils/mapper.service';
import { CacheService } from '../../core/storage/cache.service';

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
        if (this.sort) {
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
        public _cacheService: CacheService,
        public snackBar: MatSnackBar,
        public authenticationService: AuthenticationService,
        public _wsseService: WsseService,
        public distributionService: DistributionService,
    ) { }

    ngOnChanges() {
        this.checkData();
        // this.checkTable();
    }

    ngDoCheck() {
        if (this.entity !== this.oldEntity) {
            this.checkData();
        }
        if (!this.data.paginator) {
            this.data.paginator = this.paginator;
        }
        if (this.table !== GlobalText.TEXTS) {
            this.table = GlobalText.TEXTS;
            this.setDataTableProperties();
            this.mapperService.setMapperObject(this.entity);
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
        if (this.data.data && this.data.data.length > 0) {
            this.filled = true;
        } else {
            this.filled = false;
        }
    }

    updateData() {
        if (this.entity.__classname__ == 'DistributionData') {
            this.distributionService.getByProject(this.data.data[0].project.id).subscribe(response => {
                this.data = new MatTableDataSource(this.entity.formatArray(response));
                // update cache associated variable
                const key = (<typeof CacheService>this._cacheService.constructor)[this.entity.__classname__.toUpperCase() + 'S'];
                this._cacheService.set(key, response);

                this.setDataTableProperties();
            }, error => {
                console.error('error', error);
            });
        }
        else if (this.entity.__classname__ == 'Beneficiaries') {
            this.distributionService.getBeneficiaries(this.parentId).subscribe(
                response => {
                    this.data = new MatTableDataSource(Beneficiaries.formatArray(response));
                    // update cache associated variable
                    const key = (<typeof CacheService>this._cacheService.constructor)[this.entity.__classname__.toUpperCase() + 'S'];
                    this._cacheService.set(key, response);
                }
            );
        }
        else {
            this.service.get().subscribe(response => {
                this.data = new MatTableDataSource(this.entity.formatArray(response));
                // update cache associated variable
                const key = (<typeof CacheService>this._cacheService.constructor)[this.entity.__classname__.toUpperCase() + 'S'];
                this._cacheService.set(key, response);
            });
        }
    }

    setDataTableProperties() {
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


    checkData() {
        if (!this.data) {
            this.data = new MatTableDataSource([]);
        }
        this.setDataTableProperties();
        if (this.entity) {
            this.entityInstance = this.mapperService.instantiate(this.entity);
            this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
            this.propertiesTypes = this.entityInstance.getTypeProperties(this.entityInstance);
            this.propertiesActions = new Array();
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
            let re = /\ /gi;
            element.rights = element.rights.replace(re, "");
            let finalRight;

            this.entityInstance.getAllRights().forEach(rights => {
                let value = Object.values(rights);
                if (value[0] == element.rights) {
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
                    this.snackBar.open(this.entity.__classname__ + ' deleted', '', { duration: 3000, horizontalPosition: 'right' });
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

    applyFilter(filterValue: string): void {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        if(this.data.filter && (this.data.filter.filter || this.data.filter.filter === ''))  {
            this.data.setFilter(filterValue);
        } else {
            this.data.filter = filterValue;
        }
    }

    updateElement(updateElement: Object) {
        // console.log("update element 1:", updateElement);
        updateElement = this.entity.formatForApi(updateElement);

        if (updateElement['rights'] == "ROLE_PROJECT_MANAGER" || updateElement['rights'] == "ROLE_PROJECT_OFFICER" || updateElement['rights'] == "ROLE_FIELD_OFFICER")
            delete updateElement['country'];
        else if (updateElement['rights'] == "ROLE_REGIONAL_MANAGER" || updateElement['rights'] == "ROLE_COUNTRY_MANAGER" || updateElement['rights'] == "ROLE_READ_ONLY")
            delete updateElement['projects'];
        else {
            delete updateElement['country'];
            delete updateElement['projects'];
        }

        // console.log("update element 2:", updateElement);
        if (this.entity.__classname__ == 'User') {
            if (updateElement['password'] && updateElement['password'].length > 0) {
                this.authenticationService.requestSalt(updateElement['username']).subscribe(response => {
                    if (response) {

                        let saltedPassword = this._wsseService.saltPassword(response['salt'], updateElement['password']);
                        updateElement['password'] = saltedPassword;

                        this.service.update(updateElement['id'], updateElement).subscribe(response => {
                            this.snackBar.open(this.entity.__classname__ + ' updated', '', { duration: 3000, horizontalPosition: 'right' });
                            this.updateData();
                        }, error => {
                            // console.error("err", error);
                        });
                    }
                });
            } else {
                updateElement['password'] = this._cacheService.get(CacheService.USER).salted_password;
                this.service.update(updateElement['id'], updateElement).subscribe(response => {
                    this.snackBar.open(this.entity.__classname__ + ' updated', '', { duration: 3000, horizontalPosition: 'right' });
                    this.updateData();
                }, error => {
                    // console.error("err", error);
                });
            }
        }
        else {
            this.service.update(updateElement['id'], updateElement).subscribe(response => {
                this.snackBar.open(this.entity.__classname__ + ' updated', '', { duration: 3000, horizontalPosition: 'right' });
                this.updateData();
            }, error => {
                // console.error("err", error);
            });
        }
    }

    deleteElement(deleteElement: Object) {
        if (this.entity === Beneficiaries) {
            // console.log('delete: ', this.deleteElement['id']);
            this.service.delete(deleteElement['id'], this.parentId).subscribe(response => {
                this.snackBar.open(this.entity.__classname__ + ' deleted', '', { duration: 3000, horizontalPosition: 'right' });
                this.updateData();
            });
        } else {
            this.service.delete(deleteElement['id']).subscribe(response => {
                this.snackBar.open(this.entity.__classname__ + ' deleted', '', { duration: 3000, horizontalPosition: 'right' });
                this.updateData();
            });
        }
    }
}



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
