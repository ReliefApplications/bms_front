import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { TransactionBeneficiary } from 'src/app/model/transaction-beneficiary';
import { State } from 'src/app/model/transaction-beneficiary';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-mobile-money',
    templateUrl: './mobile-money.component.html',
    styleUrls: ['../validated-distribution.component.scss']
})
export class MobileMoneyComponent extends ValidatedDistributionComponent implements OnInit {

    sentStates = [State.Sent, State.AlreadySent, State.PickedUp];
    receivedStates = [State.PickedUp];

    ngOnInit() {
        super.ngOnInit();
        this.refreshStatuses();
        this.entity = TransactionBeneficiary;
    }

    /**
     * Opens a dialog corresponding to the ng-template passed as a parameter
     * @param template
     */
    openDialog(template: any) {
        const distributionDate = new Date(this.actualDistribution.date_distribution);
        const currentDate = new Date();
        if (currentDate.getFullYear() > distributionDate.getFullYear() ||
        (currentDate.getFullYear() === distributionDate.getFullYear() &&
        currentDate.getMonth() > distributionDate.getMonth()) ||
        (currentDate.getFullYear() === distributionDate.getFullYear() &&
        currentDate.getMonth() === distributionDate.getMonth()) &&
        currentDate.getDate() > distributionDate.getDate()) {
            this.snackbar.error(GlobalText.TEXTS.snackbar_invalid_transaction_date);
        } else {
            this.dialog.open(template);
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
                peopleCount++;
            }
        }
        return peopleCount;
    }

    refreshStatuses() {
        this.distributionService.refreshPickup(this.distributionId).subscribe(
            result => {
                if (!result) {
                    return;
                }
                this.transactionData.data.forEach(
                    (transaction, index) => {
                        if (transaction.state === 0) {
                            return;
                        }
                        result.forEach(
                            element => {
                                if (transaction.id === element.id) {
                                    this.transactionData.data[index].updateForPickup(element.moneyReceived);
                                }
                            }
                        );
                    }
                );
            }
        );
    }

    requestLogs() {
        if (this.hasRights) {
            try {
                this.distributionService.logs(this.distributionId).subscribe(
                    e => { this.snackbar.error('' + e); },
                    () => { this.snackbar.success('Logs have been sent'); },
                );
            } catch (e) {
                this.snackbar.error('Logs could not be sent : ' + e);
            }
        } else {
            this.snackbar.error('Not enough rights to request logs');
        }
    }

    codeVerif() {
        if ((new Date()).getTime() - this.lastCodeSentTime > this.SENDING_CODE_FREQ) {
            this.distributionService.sendCode(this.distributionId).toPromise()
                .then(
                    anwser => {
                        if (anwser === 'Email sent') {
                            this.lastCodeSentTime = (new Date()).getTime();
                            this.snackbar.success('Verification code has been sent at ' + this.actualUser.email);
                        }
                    },
                    () => {
                        this.lastCodeSentTime = (new Date()).getTime();
                        this.snackbar.success('Verification code has been sent at ' + this.actualUser.email);
                    }
                )
                .catch(
                    (err) => {
                        this.snackbar.error('Could not send code :' + err);
                    }
                );
        } else {
            this.snackbar.error('The last code was sent less than 10 seconds ago, you should wait.');
        }
    }

    /**
     * To transact
     */
    confirmTransaction() {
        if (this.hasRightsTransaction) {
            this.progression = 0;
            this.cacheService.getUser().subscribe(result => {
                this.actualUser = result;
                if (!this.actualUser.email && this.actualUser.username) {
                    this.actualUser['email'] = this.actualUser.username;
                }
                if (this.actualDistribution.commodities && this.actualDistribution.commodities[0]) {
                    this.transacting = true;
                    this.correctCode = true;
                    this.distributionService.transaction(this.distributionId, this.enteredCode)
                        .pipe(
                            finalize(
                                () => {
                                    this.transacting = false;
                                    this.chartAccepted = false;
                                    this.correctCode = false;
                                    this.enteredCode = '';
                                    this.dialog.closeAll();
                                    clearInterval(this.interval);
                                    this.refreshStatuses();
                                }
                            )
                        ).subscribe(
                            (success: any) => {
                                if (this.transactionData) {
                                    this.transactionData.data.forEach(
                                        (element, index) => {

                                            success.already_sent.forEach(
                                                beneficiary => {
                                                    if (element.id === beneficiary.beneficiary.id) {
                                                        this.transactionData.data[index].updateState('Already sent');
                                                        this.setTransactionMessage(beneficiary, index);
                                                    }
                                                }
                                            );
                                            success.failure.forEach(
                                                beneficiary => {
                                                    if (element.id === beneficiary.beneficiary.id) {
                                                        this.transactionData.data[index].updateState('Sending failed');
                                                        this.setTransactionMessage(beneficiary, index);
                                                    }
                                                }
                                            );
                                            success.no_mobile.forEach(
                                                beneficiary => {
                                                    if (element.id === beneficiary.beneficiary.id) {
                                                        this.transactionData.data[index].updateState('No phone');
                                                        this.setTransactionMessage(beneficiary, index);
                                                    }
                                                }
                                            );
                                            success.sent.forEach(
                                                beneficiary => {
                                                    if (element.id === beneficiary.beneficiary.id) {
                                                        this.transactionData.data[index].updateState('Sent');
                                                        this.setTransactionMessage(beneficiary, index);
                                                    }
                                                }
                                            );
                                        }
                                    );
                                }
                            }
                        );

                    const progression = 0;
                    // let peopleLeft = this.getAmount('waiting', this.actualDistribution.commodities[0]);
                    // peopleLeft = peopleLeft / this.actualDistribution.commodities[0].value;

                    // this.interval = setInterval(() => {
                    //     this.distributionService.checkProgression(this.distributionId)
                    //         .subscribe(
                    //             distributionProgression => {
                    //                 if (distributionProgression) {
                    //                     if (distributionProgression !== progression) {
                    //                         progression = distributionProgression;

                    //                         this.progression = Math.floor((result / peopleLeft) * 100);
                    //                     }
                    //                 }
                    //             }
                    //         );
                    // }, 3000);

                } else {
                    this.snackbar.error(this.TEXT.distribution_no_valid_commodity);
                }
            });
        } else {
            this.snackbar.error(this.TEXT.distribution_no_right_transaction);
        }

        this.chartAccepted = false;
    }
}
