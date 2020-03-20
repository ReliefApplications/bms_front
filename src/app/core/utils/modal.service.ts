import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { ModalAddBeneficiaryComponent } from 'src/app/components/modals/modal-add-beneficiary/modal-add-beneficiary.component';
import { ModalAddCommodityComponent } from 'src/app/components/modals/modal-add-commodity/modal-add-commodity.component';
import { ModalAddCriteriaComponent } from 'src/app/components/modals/modal-add-criteria/modal-add-criteria.component';
import { ModalAddComponent } from 'src/app/components/modals/modal-add/modal-add.component';
import { ModalDeleteBeneficiaryComponent } from 'src/app/components/modals/modal-delete-beneficiary/modal-delete-beneficiary.component';
import { ModalDeleteComponent } from 'src/app/components/modals/modal-delete/modal-delete.component';
import { ModalDetailsComponent } from 'src/app/components/modals/modal-details/modal-details.component';
import { ModalEditComponent } from 'src/app/components/modals/modal-edit/modal-edit.component';
import { LanguageService } from 'src/app/core/language/language.service';
import { Beneficiary } from 'src/app/models/beneficiary';
import { Commodity } from 'src/app/models/commodity';
import { Criteria } from 'src/app/models/criteria';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { Distribution } from 'src/app/models/distribution';
import { CommodityService } from '../api/commodity.service';
import { CriteriaService } from '../api/criteria.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { SnackbarService } from '../logging/snackbar.service';
import { NetworkService } from '../network/network.service';

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    public referedClassToken;
    public referedClassService;
    public referedClassInstance;

    isCompleted = new Subject;
    isLoading = new Subject;
    dataSubject = new Subject;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        private snackbar: SnackbarService,
        public dialog: MatDialog,
        public authenticationService: AuthenticationService,
        public networkService: NetworkService,
        public languageService: LanguageService,
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
            case 'addBeneficiary':
                dialogRef = this.openAddBeneficiaryDialog(dialogDetails.distribution);
                break;
            case 'details':
                dialogRef = this.openDetailsDialog(dialogDetails.element);
                break;
            case 'edit':
                dialogRef = this.openEditDialog(dialogDetails.element);
                break;
            case 'delete':
                if (dialogDetails.element instanceof Beneficiary) {
                    dialogRef = this.openDeleteBeneficiaryDialog(dialogDetails.element);
                } else {
                    dialogRef = this.openDeleteDialog(dialogDetails.element);
                }
                break;
            case 'deleteMany':
                dialogRef = this.openDeleteManyDialog(dialogDetails.ids, dialogDetails.name);
                break;
            case 'visit':
                this.referedClassService.visit(dialogDetails.element.get('id'));
                break;
            default:
                this.snackbar.error('Modal error');
                break;
        }

        if (dialogRef) {
            const subscription = dialogRef.afterClosed().subscribe((closeMethod: any) => {
                // TODO: add enum for modal methods
                if (closeMethod === 'Add') {
                    this.isLoading.next();
                    this.referedClassService.create(this.referedClassInstance.modelToApi()).subscribe((response) => {
                        // If the response is null, it means we are offline and the request was stored, not really made
                        if (response) {
                            this.snackbar.success(
                                this.referedClassInstance.title + ' ' + this.language.snackbar_created_successfully);
                        }
                        this.isCompleted.next(true);
                        this.dataSubject.next(response);
                    });

                } else if (closeMethod === 'Edit') {
                    this.updateElement(dialogDetails.element);
                } else if (closeMethod === 'Delete') {
                    this.isLoading.next();
                    if (dialogDetails.action === 'delete') {
                        this.deleteElement(dialogDetails.element);
                    } else {
                        this.deleteMany(dialogDetails.ids);
                    }
                } else if (closeMethod && closeMethod.method === 'AddBeneficiary') {
                    this.isLoading.next();
                    this.addBeneficiary(closeMethod.beneficiaries, closeMethod.justification, dialogDetails.distribution);
                } else if (closeMethod && closeMethod.method === 'DeleteBeneficiary') {
                    this.isLoading.next();
                    this.deleteBeneficiary(dialogDetails.element, closeMethod.justification);
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

    openAddBeneficiaryDialog(distribution: Distribution) {
        return this.dialog.open(ModalAddBeneficiaryComponent, {
            data: {
                distribution: distribution
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

    openDeleteBeneficiaryDialog(beneficiary: Beneficiary) {
        return this.dialog.open(ModalDeleteBeneficiaryComponent, {
            data: {
                beneficiary: beneficiary.getIdentifyingName(),
            }
        });
    }

    openDeleteManyDialog(ids: Array<string>, name: string) {
        return this.dialog.open(ModalDeleteComponent, {
            data: {
                name: name ? name : this.language.modal_delete_many,
            }
        });
    }


    openAddCriteriaDialog(): Observable<Criteria> {
        this.referedClassToken = Criteria;
        this.referedClassService = CriteriaService;
        const dialogRef = this.dialog.open(ModalAddCriteriaComponent, {
            data: {
                objectInstance: new Criteria(),
            }
        });
        return dialogRef.afterClosed();
    }

    openAddCommodityDialog(): Observable<Commodity> {

        this.referedClassToken = Commodity;
        this.referedClassService = CommodityService;
        const dialogRef = this.dialog.open(ModalAddCommodityComponent, {
            data: {
                objectInstance: new Commodity(),
            }
        });
        return dialogRef.afterClosed();
    }

    updateElement(updateElement) {
        const apiUpdateElement = updateElement.modelToApi(updateElement);
        this.referedClassService.update(apiUpdateElement['id'], apiUpdateElement).subscribe((response: any) => {
            // If the response is null, it means we are offline and the request was stored, not really made
            if (response) {
                this.snackbar.success(this.language.snackbar_updated_successfully);
            }
            this.isCompleted.next(true);
            this.dataSubject.next(response);
        }, (_error: any) => {
            this.isCompleted.next(false);
        });
    }

    deleteElement(deleteElement: CustomModel) {

        if (deleteElement instanceof Beneficiary) {
            this.referedClassService.delete(deleteElement.get('id'), deleteElement.get('distributionId')).subscribe((response: any) => {
                this.isCompleted.next(true);
                this.dataSubject.next(response);
            }, (_error: any) => {
                this.isCompleted.next(false);
            });
        } else {
            this.referedClassService.delete(deleteElement.get('id')).subscribe((response: any) => {
                this.isCompleted.next(true);
                this.dataSubject.next(response);
            }, (_error: any) => {
                this.isCompleted.next(false);
            });
        }
    }

    addBeneficiary(beneficiaries: Beneficiary[], justification: string, distribution: Distribution) {
        const beneficiariesArray = beneficiaries.map((beneficiary: Beneficiary) => beneficiary.modelToApi());
        this.referedClassService.add(distribution.get('id'), beneficiariesArray, justification)
            .subscribe(
                success => {
                    this.isCompleted.next(true);
                    this.dataSubject.next(success);
                },
                error => {
                    this.isCompleted.next(false);
                    this.snackbar.error(error.error ? error.error : this.language.distribution_beneficiary_not_added);
                });

    }

    deleteBeneficiary(beneficiary: Beneficiary, justification) {
        this.referedClassService.delete(beneficiary.get('id'), beneficiary.get('distributionId'), justification)
            .subscribe((response: any) => {
                this.isCompleted.next(true);
                this.dataSubject.next(response);
            }, (_error: any) => {
                this.isCompleted.next(false);
            });
    }

    deleteMany(ids: Array<number>) {
        this.referedClassService.deleteMany(ids).subscribe((response: any) => {
            this.isCompleted.next(true);
            this.dataSubject.next(response);
        }, (_error: any) => {
            this.isCompleted.next(false);
        });
    }
}
