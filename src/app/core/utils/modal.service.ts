import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subject } from 'rxjs';
import { ModalAddCommodityComponent } from 'src/app/components/modals/modal-add-commodity/modal-add-commodity.component';
import { ModalAddCriteriaComponent } from 'src/app/components/modals/modal-add-criteria/modal-add-criteria.component';
import { ModalAddComponent } from 'src/app/components/modals/modal-add/modal-add.component';
import { ModalDeleteComponent } from 'src/app/components/modals/modal-delete/modal-delete.component';
import { ModalDetailsComponent } from 'src/app/components/modals/modal-details/modal-details.component';
import { ModalEditComponent } from 'src/app/components/modals/modal-edit/modal-edit.component';
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { Commodity } from 'src/app/model/commodity.new';
import { Criteria } from 'src/app/model/criteria.new';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { LanguageService } from 'src/texts/language.service';
import { CommodityService } from '../api/commodity.service';
import { CriteriaService } from '../api/criteria.service';
import { NetworkService } from '../api/network.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { SnackbarService } from '../logging/snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    public referedClassToken;
    public referedClassService;
    public referedClassInstance;

    isCompleted = new Subject;

    // Language
    public language = this.languageService.selectedLanguage;

    constructor(
        private snackbar: SnackbarService,
        public dialog: MatDialog,
        public authenticationService: AuthenticationService,
        public networkService: NetworkService,
        private languageService: LanguageService,
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
                // TODO: add enum for modal methods
                if (closeMethod === 'Add') {
                    this.referedClassService.create(this.referedClassInstance.modelToApi()).subscribe(() => {
                        this.snackbar.success(
                            this.referedClassInstance.title + ' ' + this.language.update_beneficiary_created_successfully
                        );
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
    // TODO: don't fill with options if not necessary
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
                if (criteria) {
                    resolve(criteria);
                } else {
                    reject();
                }
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
                if (commodity) {
                    resolve(commodity);
                } else {
                    reject();
                }
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

        if (deleteElement instanceof Beneficiary) {
            this.referedClassService.delete(deleteElement.get('id'), deleteElement.get('distributionId')).subscribe(response => {
                this.isCompleted.next();
                });
        } else {
            this.referedClassService.delete(deleteElement.get('id')).subscribe(response => {
                this.isCompleted.next();
            });
        }
    }

    // createElement(createElement: Object) {
    //     createElement = this.referedClassToken.formatForApi(createElement);
    //     if (this.referedClassToken.__classname__ !== 'User' && this.referedClassToken.__classname__ !== 'Vendors') {
    //         this.referedClassService.create(createElement['id'], createElement).subscribe(
    //             response => {
    //             this.isCompleted.next();
    //             });
    //     } else {
    //         // for users, there are two step (one to get the salt and one to create the user)
    //         this.authenticationService.initializeUser(createElement['username']).subscribe(response => {
    //             if (response) {
    //               if (this.referedClassToken.__classname__ === 'Vendors') {
    //                 this.authenticationService.createVendor(createElement, response).subscribe(
    //                   () => {
    //                   });
    //               } else {
    //                 if (createElement['rights'] === 'ROLE_PROJECT_MANAGER'
    //                     || createElement['rights'] === 'ROLE_PROJECT_OFFICER'
    //                     || createElement['rights'] === 'ROLE_FIELD_OFFICER') {
    //                     delete createElement['country'];
    //                 } else if (createElement['rights'] === 'ROLE_REGIONAL_MANAGER'
    //                     || createElement['rights'] === 'ROLE_COUNTRY_MANAGER'
    //                     || createElement['rights'] === 'ROLE_READ_ONLY') {
    //                     delete createElement['projects'];
    //                 } else {
    //                     delete createElement['country'];
    //                     delete createElement['projects'];
    //                 }

    //                 this.authenticationService.createUser(createElement, response).subscribe(
    //                     () => {
    //                     this.isCompleted.next();
    //                     });
    //               }
    //             }
    //         });
    //     }
    // }
}
