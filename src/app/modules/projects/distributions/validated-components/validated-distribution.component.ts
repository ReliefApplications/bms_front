import { Component, ViewChild, OnInit, Input, Output, EventEmitter, HostListener, DoCheck } from '@angular/core';
import { DistributionData } from 'src/app/model/distribution-data';
import { GlobalText } from 'src/texts/global';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';
import { finalize, distinct } from 'rxjs/operators';
import { State } from 'src/app/model/transaction-beneficiary';

@Component({
    template: '',
    styleUrls: ['./validated-distribution.component.scss']
})
export class ValidatedDistributionComponent implements OnInit, DoCheck {

    TEXT = GlobalText.TEXTS;
    entity: any;
    loadingExport = false;
    loadingTransaction = false;
    transacting = false;
    widthScreen: number;
    heightScreen: number;
    maxWidthMobile = GlobalText.maxWidthMobile;
    language = GlobalText.language;
    selection: SelectionModel<any>;
    exportTypeTransaction = 'xls';
    progression = 0;
    correctCode = false;
    interval: NodeJS.Timer;

    // Transaction.
    readonly SENDING_CODE_FREQ = 10000; // ms
    lastCodeSentTime = 0; // ms
    actualUser = new User();
    enteredCode = '';
    chartAccepted = false;

    distributionIsStored = false;

    @Input() actualDistribution: DistributionData;
    @Input() transactionData: MatTableDataSource<any>;
    @Input() distributionId: number;
    @Input() hasRights = false;
    @Input() hasRightsTransaction = false;

    @Output() exportEmitter: EventEmitter<string> = new EventEmitter();
    @Output() storeEmitter: EventEmitter<void> = new EventEmitter();


    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.checkSize();
    }

    ngOnInit() {
        this.checkSize();
        this.refreshStatuses();
        this.loadingTransaction = false;
        this.cacheService.checkForBeneficiaries(this.actualDistribution).subscribe(
            (distributionIsStored: boolean) => this.distributionIsStored = distributionIsStored
        );
    }

    ngDoCheck(): void {
        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    constructor(
        protected distributionService: DistributionService,
        public snackbar: SnackbarService,
        public dialog: MatDialog,
        protected cacheService: AsyncacheService,
    ) { }

    getPeopleCount(): number | string {
        if (!this.transactionData) {
            return this.getPlaceholderChar();
        }
        else {
            const states = [State.NoPhone, State.NotSent, State.SendError];
            let peopleCount = 0;
            for (const beneficiary of this.transactionData.data) {
                if (states.includes(beneficiary.state)) {
                    peopleCount ++;
                }
            }
            return peopleCount;
        }
    }

    getTotalCommodityValue(commodity: any): number | string {
        return (this.transactionData ? this.transactionData.data.length * commodity.value : this.getPlaceholderChar());
    }

    getSentValue(commodity: any): number | string {
        if (!this.transactionData) {
            return this.getPlaceholderChar();
        }
        else {
            let totalCommodityValue = 0;
            for (const beneficiary of this.transactionData.data) {
                if (beneficiary.used) {
                    totalCommodityValue += commodity.value;
                }
            }
            return totalCommodityValue;
        }
    }

    getReceivedValue(commodity: any): number | string {
        if (!this.transactionData) {
            return this.getPlaceholderChar();
        }
        else {
            const states = [State.PickedUp];
            return this.getTotalCommodityValueAccordingToState(commodity.value, states);
        }
    }

    getPercentageValue(commodity: any): number | string {
        if (!this.transactionData) {
            return this.getPlaceholderChar();
        }
        else {
            const states = [State.Sent, State.AlreadySent, State.PickedUp];
            return this.getTotalCommodityValueAccordingToState(commodity.value, states);
        }
    }

    getTotalCommodityValueAccordingToState(individualCommodityValue: number, states: number[]): number {
        let totalCommodityValue = 0;
        for (const beneficiary of this.transactionData.data) {
            if (states.includes(beneficiary.state)) {
                totalCommodityValue += individualCommodityValue;
            }
        }
        return totalCommodityValue;
    }

    getPlaceholderChar() {
        return '-';
    }


    setTransactionMessage(beneficiary, i) {

        this.transactionData.data[i].message = beneficiary.transactions[beneficiary.transactions.length - 1].message ?
            beneficiary.transactions[beneficiary.transactions.length].message : '';
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

    storeBeneficiaries() {
        this.storeEmitter.emit();
        this.distributionIsStored = true;
    }

    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
    }

    exportTransaction() {
        this.exportEmitter.emit(this.exportTypeTransaction);
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
                    // Je n'ai pas la moindre idée de l'utilité du code ci-dessous car il ne fonctionne pas,
                    // je le laisse commenté pour le moment
                    // Bises, Stan.
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

    private checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }
}
