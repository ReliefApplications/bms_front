import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { TransactionGeneralRelief } from 'src/app/model/transaction-voucher';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-general-relief',
    templateUrl: '../validated-distribution.component.html',
    styleUrls: ['../validated-distribution.component.scss', './general-relief.component.scss']
})
export class GeneralReliefComponent extends ValidatedDistributionComponent implements OnInit {

    checkedLines: TransactionGeneralRelief[] = [];
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
            for (const generalRelief of line.generalReliefs) {
                generalReliefsId.push(generalRelief.id);
                line.used = new Date();
            }
        }
        // Request to the API to set the General Reliefs as distributed
        this.distributionService.distributeGeneralReliefs(generalReliefsId).subscribe(() => {
            this.checkedLines = [];
            this.selection = new SelectionModel<any>(true, []);
        }, err => {
            console.error(err);
        }, () => {
            this.distributed = false;
        });
    }

}
