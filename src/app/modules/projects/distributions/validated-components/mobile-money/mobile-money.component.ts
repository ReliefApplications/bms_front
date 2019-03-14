import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { TransactionBeneficiary } from 'src/app/model/transaction-beneficiary';
import { State } from 'src/app/model/transaction-beneficiary';

@Component({
    selector: 'app-mobile-money',
    templateUrl: '../validated-distribution.component.html',
    styleUrls: ['../validated-distribution.component.scss', './mobile-money.component.scss']
})
export class MobileMoneyComponent extends ValidatedDistributionComponent implements OnInit {

    sentStates = [State.Sent, State.AlreadySent, State.PickedUp];
    receivedStates = [State.PickedUp];

    ngOnInit() {
        super.ngOnInit();
        this.entity = TransactionBeneficiary;
    }

    /**
     * Opens a dialog corresponding to the ng-template passed as a parameter
     * @param template
     */
    openDialog(template: any) {
        const distributionDate = new Date(this.actualDistribution.date_distribution);
        if (new Date() < distributionDate) {
            this.dialog.open(template);
        } else {
            this.snackbar.error(this.TEXT.snackbar_invalid_transaction_date);
        }
    }

    getCommoditySentAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        return (this.sentStates.includes(beneficiary.state) ? commodity.value : 0);
    }

    getCommodityReceivedAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        return (this.receivedStates.includes(beneficiary.state) ? commodity.value : 0);
    }

    getPeopleCount(): number {
        const states = [State.NoPhone, State.NotSent, State.SendError];
        let peopleCount = 0;
        for (const beneficiary of this.transactionData.data) {
            if (states.includes(beneficiary.state)) {
                peopleCount ++;
            }
        }
        return peopleCount;
    }

    exportTransaction() {
        this.exportEmitter.emit(
            {
                type: this.exportTypeTransaction,
                distribution: 'transaction'
            }
        );
    }
}
