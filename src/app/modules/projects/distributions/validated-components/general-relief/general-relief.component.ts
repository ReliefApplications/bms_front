import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { TransactionGeneralRelief } from 'src/app/model/transaction-voucher';
import { SelectionModel } from '@angular/cdk/collections';
import { DistributionService } from 'src/app/core/api/distribution.service';

@Component({
    selector: 'app-general-relief',
    templateUrl: '../validated-distribution.component.html',
    styleUrls: ['../validated-distribution.component.scss', './general-relief.component.scss']
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

    distributeVoucher() {
        this.distributed = true;

        const generalReliefsId = this.checkedLines.map(check => <number> check.generalReliefs[0].id);
        this.distributionService.distributeGeneralReliefs(generalReliefsId).subscribe(() => {
            generalReliefsId.forEach(gri => {
                for (const data of this.transactionData.data) {
                    if (data.generalReliefs[0].id === gri) {
                        data.used = new Date();
                    }
                }
            });

            this.checkedLines = [];
            this.selection = new SelectionModel<any>(true, []);
            this.distributed = false;
        }, err => {
            console.error(err);
            this.distributed = false;
        });
    }

}
