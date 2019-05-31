import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { TransactionGeneralRelief, GeneralRelief } from 'src/app/models/transaction-general-relief';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { MatTableDataSource } from '@angular/material';
import { Commodity } from 'src/app/models/commodity';
import { ModalEditComponent } from 'src/app/components/modals/modal-edit/modal-edit.component';
import { DistributionBeneficiary } from 'src/app/models/distribution-beneficiary';
import { SelectionModel } from '@angular/cdk/collections';
import { Beneficiary } from 'src/app/models/beneficiary';

@Component({
    selector: 'app-general-relief',
    templateUrl: './general-relief.component.html',
    styleUrls: ['../validated-distribution.component.scss']
})
export class GeneralReliefComponent extends ValidatedDistributionComponent implements OnInit {

    checkedLines: TransactionGeneralRelief[] = [];
    distributed = false;
    selection = new SelectionModel<TransactionGeneralRelief>(true, []);

    ngOnInit() {
        super.ngOnInit();
        this.entity = TransactionGeneralRelief;
    }

    setDistributionBeneficiaries(distributionBeneficiaries: any) {
        this.actualDistribution.set(
            'distributionBeneficiaries',
            distributionBeneficiaries
                .map((distributionBeneficiariy: any) => TransactionGeneralRelief.apiToModel(distributionBeneficiariy)));
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
        this.verifiyIsFinished();
        this.loadingTransaction = false;
    }

     /**
     * To be used everytime transactionData changes
     */
    verifiyIsFinished() {
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
            this.finishedEmitter.emit();
            this.distributionService.complete(this.actualDistribution.get('id')).subscribe();
         }
    }

    getChecked(event: any) {
        this.checkedLines = event;
    }

    distributeRelief() {
        this.distributed = true;
        // Get the General Relief's ids
        const generalReliefsId: number[] = [];
        this.checkedLines.forEach((distributionBeneficiary: TransactionGeneralRelief) => {
            const storedDistributionBeneficiaries = this.actualDistribution.get<TransactionGeneralRelief[]>('distributionBeneficiaries');
            storedDistributionBeneficiaries.forEach((storeDistributionBeneficiary: TransactionGeneralRelief) => {
                if (storeDistributionBeneficiary.get('beneficiary').get('id') === distributionBeneficiary.get('beneficiary').get('id')) {
                    const generalReliefs = storeDistributionBeneficiary.get<GeneralRelief[]>('generalReliefs')
                        .map((generalRelief: GeneralRelief) => {
                            generalReliefsId.push(generalRelief.get('id'));
                            generalRelief.set('distributedAt', new Date());
                            return generalRelief;
                        });
                    storeDistributionBeneficiary.set('generalReliefs', generalReliefs);
                    storeDistributionBeneficiary.set('distributedAt', new Date());
                }
            });
            this.actualDistribution.set('distributionBeneficiaries', storedDistributionBeneficiaries);
        });

        // Request to the API to set the General Reliefs as distributed
        this.distributionService.distributeGeneralReliefs(generalReliefsId).subscribe(() => {
            this.checkedLines = [];
            // Store the modified distribution in the cache
            this.cacheService.set(
                `${AsyncacheService.DISTRIBUTIONS}_${this.actualDistribution.get('id')}_beneficiaries`,
                this.actualDistribution.modelToApi());
                this.verifiyIsFinished();
        }, err => {
            console.error(err);
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
        return (correspondingGeneralRelief.get('distributedAt') ? commodity.get('value') : 0 );
    }

    /**
	* open each modal dialog
	*/
    openDialog(dialogDetails: any): void {

        if (dialogDetails.action === 'details') {
            this.modalService.openDialog(TransactionGeneralRelief, this.beneficiariesService, dialogDetails);
            this.modalService.isCompleted.subscribe(() => {
            });
        } else if (dialogDetails.action === 'edit') {
            const dialogRef = this.dialog.open(ModalEditComponent, {
                data: {
                    objectInstance: dialogDetails.element
                 }
            });
            dialogRef.afterClosed().subscribe((closeMethod: string) => {
                this.updateElement(dialogDetails.element);
            });
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
        this.distributionService.addNotes(generalReliefsForApi).subscribe(() => {
        });

        // Then, send the updatee associated Beneficiary to the api
        const apiUpdateElement = updateElement.get<Beneficiary>('beneficiary').modelToApi();
        this.beneficiariesService.update(apiUpdateElement['id'], apiUpdateElement).subscribe();


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
        this._cacheService.set(
            `${AsyncacheService.DISTRIBUTIONS}_${this.actualDistribution.get('id')}_beneficiaries`, this.actualDistribution.modelToApi());
    }
}
