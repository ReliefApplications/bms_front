import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { Commodity } from 'src/app/model/commodity';
import { State, TransactionMobileMoney } from 'src/app/model/transaction-mobile-money';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { User } from 'src/app/model/user';

@Component({
    selector: 'app-mobile-money',
    templateUrl: './mobile-money.component.html',
    styleUrls: ['../validated-distribution.component.scss', './mobile-money.component.scss']
})
export class MobileMoneyComponent extends ValidatedDistributionComponent implements OnInit {

    // sentStates = [State.Sent, State.AlreadySent, State.PickedUp];
    // receivedStates = [State.PickedUp];

    transactionData: MatTableDataSource<TransactionMobileMoney>;


    ngOnInit() {
        super.ngOnInit();
        this.entity = TransactionMobileMoney;
    }

    setDistributionBeneficiaries(distributionBeneficiaries: any) {
        this.actualDistribution.set(
            'distributionBeneficiaries',
            distributionBeneficiaries
                .map((distributionBeneficiariy: any) => TransactionMobileMoney.apiToModel(distributionBeneficiariy)));
    }

    formatTransactionTable() {

        let values = '';
        this.actualDistribution.get<Commodity[]>('commodities').forEach((commodity, index) => {
            if (index > 0) {
                values += ', ';
            }
            values += commodity.get('value') + ' ' + commodity.get('unit');
        });

        const distributionBeneficiaries = this.actualDistribution.get<TransactionMobileMoney[]>('distributionBeneficiaries')
            .map((transaction: TransactionMobileMoney) => {
                transaction.set('values', values);
                return transaction;
            });

        this.actualDistribution.set('distributionBeneficiaries', distributionBeneficiaries);
        this.transactionData = new MatTableDataSource(distributionBeneficiaries);
        this.verifiyIsFinished();
        this.loadingTransaction = false;
        this.refreshStatuses();
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
                (distributionBeneficiary: TransactionMobileMoney) => {
                    const stateId = distributionBeneficiary.get<State>('state').get<string>('id');
                    if (stateId === '-1' || stateId === '-2' || stateId === '0') {
                        amount++;
                    }
                }
            );
        }
         if (amount === 0) {
            this.finishedEmitter.emit();
         }
    }

    refreshStatuses() {
        this.distributionService.refreshPickup(this.distributionId).subscribe(
            result => {
                if (!result) {
                    return;
                }
                this.transactionData.data.forEach(
                    (transaction: TransactionMobileMoney, index) => {
                        if (transaction.get('state').get<string>('id') === '0') {
                            return;
                        }
                        result.forEach(distributionBeneficiary => {
                            if (transaction.get('beneficiary').get('id') === distributionBeneficiary.beneficiary.id) {
                                // Is moneyReceived really a field ???
                                this.transactionData.data[index].updateForPickup(distributionBeneficiary.moneyReceived);
                                this.verifiyIsFinished();
                            }
                        });
                    }
                );
            }, error => {
                this.snackbar.error(this.language.snackbar_pickup_error);
            }
        );
    }

    /**
     * Opens a dialog corresponding to the ng-template passed as a parameter
     * @param template
     */
    openDialog(template: any) {
        this.cacheService.getUser().subscribe(result => {
            this.actualUser = User.apiToModel(result);
            if (!this.actualUser.get('email') && this.actualUser.get('username')) {
                this.actualUser.set('email', this.actualUser.get('username'));
            }
            this.codeVerif();
            const distributionDate = new Date(this.actualDistribution.get('date'));
            if (new Date() < distributionDate) {
                this.dialog.open(template);
            } else {
                this.snackbar.error(this.language.snackbar_invalid_transaction_date);
            }
        });
    }

    getCommoditySentAmountFromBeneficiary(commodity: Commodity, beneficiary: TransactionMobileMoney): number {
        return (parseInt(beneficiary.get('state').get('id'), 10) > 0 ? commodity.get('value') : 0);
    }

    getCommodityReceivedAmountFromBeneficiary(commodity: Commodity, beneficiary: any): number {
        return (parseInt(beneficiary.get('state').get('id'), 10) > 2 ? commodity.get('value') : 0);
    }

    getPeopleCount(): number {
        let peopleCount = 0;
        for (const distributionBeneficiary of this.transactionData.data) {
            if (parseInt(distributionBeneficiary.get('state').get('id'), 10) <= 0) {
                peopleCount++;
            }
        }
        return peopleCount;
    }

    requestLogs() {
        if (this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR')) {
            try {
                this.distributionService.logs(this.actualDistribution.get('id')).subscribe(
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
            this.distributionService.sendCode(this.actualDistribution.get('id')).toPromise()
                .then(
                    anwser => {
                        if (anwser === 'Email sent') {
                            this.lastCodeSentTime = (new Date()).getTime();
                            this.snackbar.success('Verification code has been sent at ' + this.actualUser.get('email'));
                        }
                    },
                    () => {
                        this.lastCodeSentTime = (new Date()).getTime();
                        this.snackbar.success('Verification code has been sent at ' + this.actualUser.get('email'));
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
        if (this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR')) {
            this.progression = 0;
            this.transacting = true;
            this.correctCode = true;
            this.distributionService.transaction(this.actualDistribution.get('id'), this.enteredCode)
                .pipe(
                    finalize(
                        () => {
                            this.transacting = false;
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
                            this.transactionData.data.forEach((actualDistributionBeneficiary: TransactionMobileMoney) => {
                                    const actualBeneficiaryId = actualDistributionBeneficiary.get('beneficiary').get('id');

                                    success.already_sent.forEach(
                                        distributionBeneficiaryFromApi => {
                                            if (actualBeneficiaryId === distributionBeneficiaryFromApi.beneficiary.id) {
                                                actualDistributionBeneficiary.updateState('2');
                                                actualDistributionBeneficiary = this.setTransactionMessage(
                                                    distributionBeneficiaryFromApi, actualDistributionBeneficiary);
                                            }
                                        }
                                    );
                                    success.failure.forEach(
                                        distributionBeneficiaryFromApi => {
                                            if (actualBeneficiaryId === distributionBeneficiaryFromApi.beneficiary.id) {
                                                actualDistributionBeneficiary.updateState('0');
                                                actualDistributionBeneficiary = this.setTransactionMessage(
                                                    distributionBeneficiaryFromApi, actualDistributionBeneficiary);
                                            }
                                        }
                                    );
                                    success.no_mobile.forEach(
                                        distributionBeneficiaryFromApi => {
                                            if (actualBeneficiaryId === distributionBeneficiaryFromApi.beneficiary.id) {
                                                actualDistributionBeneficiary.updateState('-1');
                                                actualDistributionBeneficiary = this.setTransactionMessage(
                                                    distributionBeneficiaryFromApi, actualDistributionBeneficiary);
                                            }
                                        }
                                    );
                                    success.sent.forEach(
                                        distributionBeneficiaryFromApi => {
                                            if (actualBeneficiaryId === distributionBeneficiaryFromApi.beneficiary.id) {
                                                actualDistributionBeneficiary.updateState('1');
                                                actualDistributionBeneficiary = this.setTransactionMessage(
                                                    distributionBeneficiaryFromApi, actualDistributionBeneficiary);
                                            }
                                        }
                                    );
                                }
                            );
                        }
                        this.verifiyIsFinished();
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
            this.snackbar.error(this.language.distribution_no_right_transaction);
        }
    }

    /**
	* open each modal dialog
	*/
    openModal(dialogDetails: any): void {
        // Can only be a modalDetails
        this.modalService.openDialog(TransactionMobileMoney, this.beneficiariesService, dialogDetails);
        this.modalService.isCompleted.subscribe(() => {
        });
    }
}
