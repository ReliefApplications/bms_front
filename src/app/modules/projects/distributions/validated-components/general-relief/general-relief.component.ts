import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalEditComponent } from 'src/app/components/modals/modal-edit/modal-edit.component';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Beneficiary } from 'src/app/models/beneficiary';
import { Commodity } from 'src/app/models/commodity';
import { GeneralRelief, TransactionGeneralRelief } from 'src/app/models/transaction-general-relief';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { Subscription, forkJoin } from 'rxjs';

@Component({
    selector: 'app-general-relief',
    templateUrl: './general-relief.component.html',
    styleUrls: ['../validated-distribution.component.scss']
})
export class GeneralReliefComponent extends ValidatedDistributionComponent implements OnInit {

    distributed = false;
    completed = false;
    selection = new SelectionModel<TransactionGeneralRelief>(true, []);

    ngOnInit() {
        super.ngOnInit();
        this.entity = TransactionGeneralRelief;
    }

    setDistributionBeneficiaries(distributionBeneficiaries: any) {
        this.actualDistribution.set(
            'distributionBeneficiaries',
            distributionBeneficiaries
                .map((distributionBeneficiary: any) =>
                    TransactionGeneralRelief.apiToModel(distributionBeneficiary, this.actualDistribution.get('id'))));
    }

    formatTransactionTable() {

        let values = '';
        this.actualDistribution.get<Commodity[]>('commodities').forEach((commodity, index) => {
            if (index > 0) {
                values += ', ';
            }
            values += commodity.get('value') + ' ' + commodity.get('unit');
        });

        const distributionBeneficiaries = this.actualDistribution.get<TransactionGeneralRelief[]>('distributionBeneficiaries')
            .map((transaction: TransactionGeneralRelief) => {
                transaction.set('values', values);
                return transaction;
            });

        this.actualDistribution.set('distributionBeneficiaries', distributionBeneficiaries);
        this.transactionData = new MatTableDataSource(distributionBeneficiaries);
        this.verifyIsFinished();
        this.loadingTransaction = false;

    }

     /**
     * To be used everytime transactionData changes
     */
    verifyIsFinished() {
        let amount: number;
        if (!this.transactionData) {
            amount = 0;
        } else {
            amount = 0;
            this.transactionData.data.forEach(
                (distributionBeneficiary: TransactionGeneralRelief) => {
                    if (distributionBeneficiary.get('distributedAt') === null) {
                        amount++;
                    }
                }
            );
        }
         if (amount === 0) {
            // this.distributionService.complete(this.actualDistribution.get('id')).subscribe();
            this.finishedEmitter.emit();
         }

    }

    distributeRelief() {
        // Get the General Relief's ids
        const generalReliefsId: number[] = [];
        this.selection.selected.forEach((selectedDistributionBeneficiary: TransactionGeneralRelief) => {
            this.actualDistribution.get<TransactionGeneralRelief[]>('distributionBeneficiaries')
                .forEach((distributionBeneficiary: TransactionGeneralRelief) => {
                    if (distributionBeneficiary.get('beneficiary').get('id') ===
                        selectedDistributionBeneficiary.get('beneficiary').get('id')) {

                        distributionBeneficiary.get<GeneralRelief[]>('generalReliefs').forEach(
                            (generalRelief: GeneralRelief) => generalReliefsId.push(generalRelief.get('id'))
                        );
                    }
                });
        });

        // Request to the API to set the General Reliefs as distributed
        this.distributionService.distributeGeneralReliefs(generalReliefsId).subscribe((result: any) => {
            if (result) {
                this.completed = result[2] === '0' ? true : false;
            }

            // Store the modified distribution in the cache
            this.cacheService.set(
                `${AsyncacheService.DISTRIBUTIONS}_${this.actualDistribution.get('id')}`,
                this.actualDistribution.modelToApi()
            ).subscribe();

            this.selection.selected.forEach((selectedDistributionBeneficiary: TransactionGeneralRelief) => {
                const distributionBeneficiaries = this.actualDistribution.get<TransactionGeneralRelief[]>('distributionBeneficiaries');
                distributionBeneficiaries.forEach((distributionBeneficiary: TransactionGeneralRelief) => {
                    if (distributionBeneficiary.get('beneficiary').get('id') ===
                    selectedDistributionBeneficiary.get('beneficiary').get('id')) {
                        const generalReliefs = distributionBeneficiary.get<GeneralRelief[]>('generalReliefs')
                        .map((generalRelief: GeneralRelief) => {
                            generalRelief.set('distributedAt', new Date());
                            return generalRelief;
                        });
                        distributionBeneficiary.set('generalReliefs', generalReliefs);
                        distributionBeneficiary.set('distributedAt', new Date());
                    }
                });
                this.actualDistribution.set('distributionBeneficiaries', distributionBeneficiaries);
                });
                if (this.completed) {
                    this.finishedEmitter.emit();
                }
                this.selection = new SelectionModel<TransactionGeneralRelief>(true, []);

        }, (_err: any) => {
            this.selection = new SelectionModel<TransactionGeneralRelief>(true, []);
            this.distributed = false;
        }, () => {
            this.distributed = false;
        });
    }

    getCommoditySentAmountFromBeneficiary(commodity: Commodity, beneficiary: TransactionGeneralRelief): number {
        const commodityInDistribution = this.actualDistribution.get<Commodity[]>('commodities')
            .filter((commodityInList: Commodity) => commodityInList.get('name') === commodity.get('name'))[0];
        const commodityIndex = this.actualDistribution.get<Commodity[]>('commodities').indexOf(commodityInDistribution);
        if (!beneficiary.get('generalReliefs')) {
            return 0;
        }
        const correspondingGeneralRelief = beneficiary.get<GeneralRelief[]>('generalReliefs')[commodityIndex];
        if (correspondingGeneralRelief) {
            return (correspondingGeneralRelief.get('distributedAt') ? commodity.get('value') : 0 );
        }

    }

    /*
	* open each modal dialog
	*/
    openDialog(dialogDetails: any): void {

        this.modalSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        let completeSubscription = null;

        if (dialogDetails.action === 'details') {
            this.modalService.openDialog(TransactionGeneralRelief, this.beneficiariesService, dialogDetails);
            completeSubscription = this.modalService.isCompleted.subscribe((_response: boolean) => {
            });
        } else if (dialogDetails.action === 'edit') {
            const dialogRef = this.dialog.open(ModalEditComponent, {
                data: {
                    objectInstance: dialogDetails.element
                 }
            });
            completeSubscription = dialogRef.afterClosed().subscribe((response: string) => {
                if (response) {
                    this.updateElement(dialogDetails.element);
                }
            });
        } else if (dialogDetails.action === 'delete') {
            dialogDetails.element = dialogDetails.element.get('beneficiary');
            this.modalService.openDialog(Beneficiary, this.beneficiariesService, dialogDetails);
            completeSubscription = this.modalService.isCompleted.subscribe((response: boolean) => {
                if (response) {
                    this.getDistributionBeneficiaries();
                } else {
                    this.loadingTransaction = false;
                }
            });
        }  else if (dialogDetails.action === 'addBeneficiary') {
            this.modalService.openDialog(Beneficiary, this.beneficiariesService, dialogDetails);
            completeSubscription = this.modalService.isCompleted.subscribe((response: boolean) => {
                if (this.networkService.getStatus()) {
                    if (response) {
                        this.getDistributionBeneficiaries();
                    } else {
                        this.loadingTransaction = false;
                    }
                } else {
                    this.loadingTransaction = false;
                }
            });
        }
        if (completeSubscription) {
            this.modalSubscriptions = [completeSubscription];
        }
    }


    updateElement(updateElement: TransactionGeneralRelief) {
        // First, distribute the global notes array between all the general reliefs of the transaction
        const notes = updateElement.get<Array<string>>('notes');
        notes.forEach((note: string, index: number, array: string[]) =>  {
            if (note === null) {
                array[index] = '';
            }
        });
        const generalReliefs = updateElement.get<GeneralRelief[]>('generalReliefs');
        generalReliefs.forEach((generalRelief: GeneralRelief, index) => {
            generalRelief.set('notes', notes[index]);
        });
        updateElement.set('generalReliefs', generalReliefs);

        // Then, send the updated general reliefs to the api
        const generalReliefsForApi = generalReliefs.map((generalRelief: GeneralRelief) => generalRelief.modelToApi());
        const addNotesObservable = this.distributionService.addNotes(generalReliefsForApi);

        // Then, send the updatee associated Beneficiary to the api
        const apiUpdateElement = updateElement.get<Beneficiary>('beneficiary').modelToApi();
        const updateObservable = this.beneficiariesService.update(apiUpdateElement['id'], apiUpdateElement);

        forkJoin(addNotesObservable, updateObservable).subscribe(() => {
            // Then, replace the old value of the transaction by updateElement in the actual distribution
            const distributionBeneficiaries = this.actualDistribution.get<TransactionGeneralRelief[]>('distributionBeneficiaries');
            distributionBeneficiaries.forEach((distributionBeneficiary: TransactionGeneralRelief) => {
                if (distributionBeneficiary.get('beneficiary').get('id') === updateElement.get('beneficiary').get('id')) {
                    distributionBeneficiary = updateElement;
                }
            });
            this.actualDistribution.set('distributionBeneficiaries', distributionBeneficiaries);
            this.transactionData = new MatTableDataSource(distributionBeneficiaries);
            // Then we store the updated distribution in the cache
            this.hideSnackEmitter.emit();
            this.storeEmitter.emit(this.actualDistribution);
            this.snackbar.success(this.language.snackbar_updated_successfully);
        });

    }
}
