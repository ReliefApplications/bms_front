import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { TransactionGeneralRelief } from 'src/app/model/transaction-general-relief';
import { SelectionModel } from '@angular/cdk/collections';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

@Component({
    selector: 'app-general-relief',
    templateUrl: './general-relief.component.html',
    styleUrls: ['../validated-distribution.component.scss']
})
export class GeneralReliefComponent extends ValidatedDistributionComponent implements OnInit {

    checkedLines: any[] = [];
    distributed = false;

    ngOnInit() {
        super.ngOnInit();
        this.selection = new SelectionModel<any>(true, []);
        this.entity = TransactionGeneralRelief;
    }

    getChecked(event: any) {
        this.checkedLines = event;
    }

    distributeRelief() {
        this.distributed = true;
        // Get the General Relief's ids
        const generalReliefsId: number[] = [];
        for (const line of this.checkedLines) {
            // Set the line as distributed
            line.used = new Date();
            // Get the id of the general reliefs that are distributed and set the general reliefs as distributed
            for (const generalRelief of line.generalReliefs) {
                generalReliefsId.push(generalRelief.id);
                generalRelief.distributed_at = new Date();
            }
            // Update the distribution locally
            const storedDistributionBenef = this.actualDistribution.distribution_beneficiaries;
            for (let i = 0; i < storedDistributionBenef.length; i++) {
                if (storedDistributionBenef[i].beneficiary.id === line.id) {
                    storedDistributionBenef[i].general_reliefs = line.generalReliefs;
                }
            }
        }

        // Request to the API to set the General Reliefs as distributed
        this.distributionService.distributeGeneralReliefs(generalReliefsId).subscribe(() => {
            this.checkedLines = [];
            this.selection = new SelectionModel<any>(true, []);
            // Store the modified distribution in the cache
            this.cacheService.set(`${AsyncacheService.DISTRIBUTIONS}_${this.actualDistribution.id}_beneficiaries`, this.actualDistribution);
        }, err => {
            console.error(err);
        }, () => {
            this.distributed = false;
        });
    }

    getCommoditySentAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        const commodityIndex = this.actualDistribution.commodities.indexOf(commodity);
        const beneficiariesCommodity = beneficiary.generalReliefs[commodityIndex];
        return (beneficiariesCommodity.distributed_at ? commodity.value : 0 );
    }
}
