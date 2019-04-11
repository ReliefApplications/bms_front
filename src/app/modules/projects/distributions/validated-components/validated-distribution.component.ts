import { Component, ViewChild, OnInit, Input, Output, EventEmitter, HostListener, DoCheck } from '@angular/core';
import { GlobalText } from 'src/texts/global';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';
import { Distribution } from 'src/app/model/distribution.new';
import { DistributionBeneficiary } from 'src/app/model/distribution-beneficiary.new';
import { Commodity } from 'src/app/model/commodity.new';
import { Observable } from 'rxjs';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';

@Component({
    template: './validated-distribution.component.html',
    styleUrls: ['./validated-distribution.component.scss']
})
export class ValidatedDistributionComponent implements OnInit {

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
    extensionType = 'xls';
    progression = 0;
    correctCode = false;
    interval: NodeJS.Timer;

    // Transaction.
    readonly SENDING_CODE_FREQ = 10000; // ms
    lastCodeSentTime = 0; // ms
    actualUser = new User();
    enteredCode = '';
    chartAccepted = false;

    // distributionIsStored = false;
    distributionId: number;

    @Input() actualDistribution: Distribution;
    transactionData: MatTableDataSource<any>;
    hasRights = false;
    hasRightsTransaction = false;
    @Input() loaderCache = false;

    @Output() storeEmitter: EventEmitter<Distribution> = new EventEmitter();
    @Output() finishedEmitter: EventEmitter<any> = new EventEmitter();

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.checkSize();
    }

    ngOnInit() {
        this.distributionId = this.actualDistribution.get<number>('id');
        this.checkSize();
        this.checkPermission();
        this.getDistributionBeneficiaries();


        // this.cacheService.checkForBeneficiaries(this.actualDistribution).subscribe(
        //     (distributionIsStored: boolean) => this.distributionIsStored = distributionIsStored
        // );
    }

    /**
     * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
     */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.transacting) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return (true);
        }
    }

    checkPermission() {
        this.cacheService.getUser().subscribe(
            result => {
                this.actualUser = result;
                if (result && result.rights) {
                    const rights = result.rights;
                    if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER') {
                        this.hasRights = true;
                    }
                    if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_COUNTRY_MANAGER') {
                        this.hasRightsTransaction = true;
                    }
                }
            }
        );
    }

        /**
     * Gets the Beneficiaries of the actual distribution to display the table
     */
    getDistributionBeneficiaries() {
        this.loadingTransaction = true;
        this.distributionService.getBeneficiaries(this.actualDistribution.get('id'))
            .subscribe(distributionBeneficiaries => {
                if (!distributionBeneficiaries) {
                    this.getDistributionBeneficiariesFromCache();
                    this.formatTransactionTable();

                } else {
                    this.setDistributionBeneficiaries(distributionBeneficiaries);
                    this.formatTransactionTable();
                }
            });
    }

    formatTransactionTable() {
        throw new Error('Abstract Method');
    }

    setDistributionBeneficiaries(distributionBeneficiaries: any) {
        throw new Error('Abstract Method');
    }

    getDistributionBeneficiariesFromCache() {
        this.cacheService.get(AsyncacheService.DISTRIBUTIONS + '_' + this.actualDistribution.get('id') + '_beneficiaries')
            .subscribe((distribution) => {
                if (distribution) {
                    this.setDistributionBeneficiaries(distribution.distribution_beneficiaries);
                    this.formatTransactionTable();
                }
            });
    }

    /**
     * To be used everytime transactionData changes
     */
    verifiyIsFinished() {
        throw new Error('Abstract Method');
    }

    storeBeneficiaries() {
        this.storeEmitter.emit(this.actualDistribution);
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
        this.distributionService.export(distributionType, fileType, this.actualDistribution.get('id')).then(
            () => {
                this.loadingExport = false;
            }
        ).catch(
            (err: any) => {
            }
        );
    }


    getReceivedValue(commodity: Commodity): number {
        let amountReceived = 0;
        for (const distributionBeneficiary of this.transactionData.data) {
            amountReceived += this.getCommodityReceivedAmountFromBeneficiary(commodity, distributionBeneficiary);
        }
        return amountReceived;
    }

    getPercentageValue(commodity: Commodity): number {
        const percentage = (this.getAmountSent(commodity) / this.getTotalCommodityValue(commodity) * 100);
        return Math.round(percentage * 100) / 100;
    }

    getAmountSent(commodity: Commodity): number {
        let amountSent = 0;
        for (const distributionBeneficiary of this.transactionData.data) {
            amountSent += this.getCommoditySentAmountFromBeneficiary(commodity, distributionBeneficiary);
        }
        return amountSent;
    }

    getTotalCommodityValue(commodity: Commodity): number {
        return this.transactionData.data.length * commodity.get<number>('value');
    }

    // Abstract
    getCommoditySentAmountFromBeneficiary(commodity: Commodity, beneficiary: DistributionBeneficiary): number {
        throw new Error('Abstract Method');
    }

    // Abstract
    getCommodityReceivedAmountFromBeneficiary(commodity: Commodity, beneficiary: DistributionBeneficiary): number {
        throw new Error('Abstract Method');
    }

    // Here actualBeneficiary is of one of the children types of DistributionBeneficiary
    setTransactionMessage(beneficiaryFromApi: any, actualBeneficiary: any) {

        actualBeneficiary.set('message',
            beneficiaryFromApi.transactions[beneficiaryFromApi.transactions.length - 1].message ?
            beneficiaryFromApi.transactions[beneficiaryFromApi.transactions.length - 1].message :
            '');
        return actualBeneficiary;
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
