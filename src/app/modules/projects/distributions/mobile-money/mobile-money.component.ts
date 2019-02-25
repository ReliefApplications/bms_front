import { Component, OnInit, Input } from '@angular/core';
import { GlobalText } from '../../../../../texts/global';
import { DistributionService } from '../../../../core/api/distribution.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-mobile-money',
  templateUrl: './mobile-money.component.html',
  styleUrls: ['./mobile-money.component.scss']
})
export class MobileMoneyComponent implements OnInit {
    TEXT = GlobalText.TEXTS;
    @Input() actualDistribution;

    public language = GlobalText.language;
    extensionType: string;

    constructor(
        public distributionService: DistributionService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.extensionType = 'xls';
        console.log(this.actualDistribution);
    }

    /**
     * Calculate commodity distribution quantities & values.
     */
    getAmount(type: string, commodity?: any): number {

        let amount: number;

        if (!this.transactionData) {
            amount = 0;
        } else if (type === 'people') {
            amount = 0;
            this.transactionData.data.forEach(
                element => {
                    if (element.state === -1 || element.state === -2 || element.state === 0) {
                        amount++;
                    }
                }
            );
        } else if (commodity) {

            if (type === 'total') {
                amount = commodity.value * this.transactionData.data.length;
            } else if (type === 'sent') {
                amount = 0;
                this.transactionData.data.forEach(
                    element => {
                        if (element.state === 1 || element.state === 2 || element.state === 3) {
                            amount += commodity.value;
                        }
                    }
                );
            } else if (type === 'received') {
                amount = 0;
                this.transactionData.data.forEach(
                    element => {
                        if (element.state === 3) {
                            amount += commodity.value;
                        }
                    }
                );
            } else if (type === 'ratio') {
                let done = 0;
                this.transactionData.data.forEach(
                    element => {
                        if (element.state === 1 || element.state === 2 || element.state === 3) {
                            done += commodity.value;
                        }
                    }
                );
                amount = Math.round((done / (commodity.value * this.transactionData.data.length)) * 100);
            }
        }
        return (amount);
    }

    /*
     * Refresh distribution statues
     */
    refreshStatuses() {
        this.distributionService.refreshPickup(this.distributionId).subscribe(
            result => {
                if (result) {
                    this.transactionData.data.forEach(
                        (transaction, index) => {
                            if (transaction.state > 0) {
                                result.forEach(
                                    element => {
                                        if (transaction.id === element.id) {
                                            this.transactionData.data[index].updateForPickup(element.moneyReceived);
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    }

    /*
     * Request transaction logs
     */
    requestLogs() {
        if (this.hasRights) {
            try {
                this.distributionService.logs(this.distributionId).subscribe(
                    e => { this.snackBar.open('' + e, '', { duration: 5000, horizontalPosition: 'center' }); },
                    () => { this.snackBar.open('Logs have been sent', '', { duration: 5000, horizontalPosition: 'center' }); },
                );
            } catch (e) {
                this.snackBar.open('Logs could not be sent : ' + e, '', { duration: 5000, horizontalPosition: 'center' });
            }
        } else {
            this.snackBar.open('Not enough rights to request logs', '', { duration: 5000, horizontalPosition: 'center' });
        }
    }

}
