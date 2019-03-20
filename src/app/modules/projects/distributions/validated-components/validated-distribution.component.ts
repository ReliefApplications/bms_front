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
    template: './validated-distribution.component.html',
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
    @Input() loaderCache = false;

    @Output() storeEmitter: EventEmitter<any> = new EventEmitter();


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

    /**
     * Requests back-end a file containing informations about the transaction
     */
    exportTransaction(fileType: string, distributionType: string) {

        this.dialog.closeAll();
        this.loadingExport = true;
        this.distributionService.export(distributionType, fileType, this.distributionId).then(
            () => {
                this.loadingExport = false;
            }
        ).catch(
            (err: any) => {
            }
        );
    }

    getTotalCommodityValue(commodity: any): number {
        return this.transactionData.data.length * commodity.value;
    }

    getReceivedValue(commodity: any): number {
        let amountReceived = 0;
        for (const beneficiary of this.transactionData.data) {
            amountReceived += this.getCommodityReceivedAmountFromBeneficiary(commodity, beneficiary);
        }
        return amountReceived;
    }

    getPercentageValue(commodity: any): number {
        const percentage = (this.getAmountSent(commodity) / this.getTotalCommodityValue(commodity) * 100);
        return Math.round(percentage * 100) / 100;
    }

    getAmountSent(commodity: any): number {
        let amountSent = 0;
        for (const beneficiary of this.transactionData.data) {
            amountSent += this.getCommoditySentAmountFromBeneficiary(commodity, beneficiary);
        }
        return amountSent;
    }

    // Abstract
    getCommoditySentAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        throw new Error('Abstract Method');
    }

    // Abstract
    getCommodityReceivedAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        throw new Error('Abstract Method');
    }

    setTransactionMessage(beneficiary, i) {

        this.transactionData.data[i].message = beneficiary.transactions[beneficiary.transactions.length - 1].message ?
            beneficiary.transactions[beneficiary.transactions.length - 1].message : '';
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

    storeBeneficiaries() {
        this.storeEmitter.emit();
        this.distributionIsStored = true;
    }

    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
    }

    private checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }
}
