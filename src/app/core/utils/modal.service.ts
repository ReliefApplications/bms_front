import { Injectable, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { SnackbarService } from '../logging/snackbar.service';
import { GlobalText } from 'src/texts/global';
import { ModalAddComponent } from 'src/app/components/modals/modal-add/modal-add.component';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { ModalDetailsComponent } from 'src/app/components/modals/modal-details/modal-details.component';
import { ModalEditComponent } from 'src/app/components/modals/modal-edit/modal-edit.component';
import { ModalDeleteComponent } from 'src/app/components/modals/modal-delete/modal-delete.component';
import { AuthenticationService } from '../authentication/authentication.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { NetworkService } from '../api/network.service';
import { AsyncacheService } from '../storage/asyncache.service';
import { Router } from '@angular/router';
import { Criteria } from 'src/app/model/criteria.new';
import { ModalAddCriteriaComponent } from 'src/app/components/modals/modal-add-criteria/modal-add-criteria.component';
import { CriteriaService } from '../api/criteria.service';
import { Commodity } from 'src/app/model/commodity.new';
import { CommodityService } from '../api/commodity.service';
import { ModalAddCommodityComponent } from 'src/app/components/modals/modal-add-commodity/modal-add-commodity.component';

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    public referedClassToken;
    public referedClassService;
    public referedClassInstance;
    public texts = GlobalText.TEXTS;

    isCompleted = new Subject;

    constructor(
        private snackbar: SnackbarService,
        public dialog: MatDialog,
        public authenticationService: AuthenticationService,
        public networkService: NetworkService,
        private _cacheService: AsyncacheService,
        private router: Router,
    ) {

    }


    /**
	* open each modal dialog
	*/
    openDialog(referedClassToken, referedClassService, dialogDetails: any): void {
        this.referedClassToken = referedClassToken;
        this.referedClassService = referedClassService;
        let dialogRef: MatDialogRef<any>;
        switch (dialogDetails.action) {
            case 'add':
                dialogRef = this.openAddDialog();
                break;
            case 'details':
                dialogRef = this.openDetailsDialog(dialogDetails.element);
                break;
            case 'edit':
                dialogRef = this.openEditDialog(dialogDetails.element);
                break;
            case 'delete':
                dialogRef = this.openDeleteDialog(dialogDetails.element);
                break;
            case 'visit':
                this.referedClassService.visit(dialogDetails.element.get('id'));
                break;
            default:
                this.snackbar.error('Modal error');
                break;
        }

        if (dialogRef) {
            const subscription = dialogRef.afterClosed().subscribe((closeMethod: string) => {
                if (closeMethod === 'Add') {
                    this.referedClassService.create(this.referedClassInstance.modelToApi()).subscribe(() => {
                        this.snackbar.success(this.referedClassInstance.title + ' ' + this.texts.update_beneficiary_created_successfully);
                        this.isCompleted.next();
                    });

                } else if (closeMethod === 'Edit') {
                    this.updateElement(dialogDetails.element);
                } else if (closeMethod === 'Delete') {
                    this.deleteElement(dialogDetails.element);
                }
                // Prevent memory leaks
                subscription.unsubscribe();
            });
        }
    }

    openAddDialog() {
        this.referedClassInstance = new this.referedClassToken();
        this.referedClassService.fillWithOptions(this.referedClassInstance);

        return this.dialog.open(ModalAddComponent, {
            data: {
                objectInstance: this.referedClassInstance,
            }
        });
    }

    openDetailsDialog(objectInfo: CustomModel) {
        this.referedClassService.fillWithOptions(objectInfo);
        return this.dialog.open(ModalDetailsComponent, {
            data: {
                objectInstance: objectInfo,
            }
        });
    }

    openEditDialog(objectInfo: CustomModel) {
        this.referedClassService.fillWithOptions(objectInfo);
            return this.dialog.open(ModalEditComponent, {
                data: {
                    objectInstance: objectInfo
                 }
            });
    }

    openDeleteDialog(objectInfo: CustomModel) {
        return this.dialog.open(ModalDeleteComponent, {
            data: {
                name: objectInfo.getIdentifyingName(),
            }
        });
    }


    openAddCriteriaDialog(): Promise<Criteria> {
        return new Promise<Criteria>((resolve, reject) => {
            this.referedClassToken = Criteria;
            this.referedClassService = CriteriaService;
            const dialogRef = this.dialog.open(ModalAddCriteriaComponent, {
                data: {
                    objectInstance: new Criteria(),
                }
            });
            dialogRef.afterClosed().subscribe((criteria) => {
                resolve(criteria);
            });
        });
    }

    openAddCommodityDialog(): Promise<Commodity> {
        return new Promise<Commodity>((resolve, reject) => {
            this.referedClassToken = Commodity;
            this.referedClassService = CommodityService;
            const dialogRef = this.dialog.open(ModalAddCommodityComponent, {
                data: {
                    objectInstance: new Commodity(),
                }
            });
            dialogRef.afterClosed().subscribe((commodity) => {
                resolve(commodity);
            });
        });
    }




    updateElement(updateElement) {
        const apiUpdateElement = updateElement.modelToApi(updateElement);
        this.referedClassService.update(apiUpdateElement['id'], apiUpdateElement).subscribe((response: any) => {
        this.isCompleted.next();
        });
    }

    deleteElement(deleteElement: CustomModel) {
            this.referedClassService.delete(deleteElement.get('id')).subscribe(response => {
            this.isCompleted.next();
            });
    }

    createElement(createElement: Object) {
        createElement = this.referedClassToken.formatForApi(createElement);
        if (this.referedClassToken.__classname__ !== 'User' && this.referedClassToken.__classname__ !== 'Vendors') {
            this.referedClassService.create(createElement['id'], createElement).subscribe(
                response => {
                this.isCompleted.next();
                });
        } else {
            // for users, there are two step (one to get the salt and one to create the user)
            this.authenticationService.initializeUser(createElement['username']).subscribe(response => {
                if (response) {
                  if (this.referedClassToken.__classname__ === 'Vendors') {
                    this.authenticationService.createVendor(createElement, response).subscribe(
                      () => {
                      });
                  } else {
                    if (createElement['rights'] === 'ROLE_PROJECT_MANAGER'
                        || createElement['rights'] === 'ROLE_PROJECT_OFFICER'
                        || createElement['rights'] === 'ROLE_FIELD_OFFICER') {
                        delete createElement['country'];
                    } else if (createElement['rights'] === 'ROLE_REGIONAL_MANAGER'
                        || createElement['rights'] === 'ROLE_COUNTRY_MANAGER'
                        || createElement['rights'] === 'ROLE_READ_ONLY') {
                        delete createElement['projects'];
                    } else {
                        delete createElement['country'];
                        delete createElement['projects'];
                    }

                    this.authenticationService.createUser(createElement, response).subscribe(
                        () => {
                        this.isCompleted.next();
                        });
                  }
                }
            });
        }
    }
}
