import { Component, OnInit, HostListener, DoCheck } from '@angular/core';
import { GlobalText } from 'src/texts/global';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DistributionData } from 'src/app/model/distribution-data';
import { Beneficiaries } from 'src/app/model/beneficiary';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { MatTableDataSource, MatDialog, MatStepper } from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { Mapper } from 'src/app/core/utils/mapper.service';
import { ImportedBeneficiary } from 'src/app/model/imported-beneficiary';
import { TransactionBeneficiary } from 'src/app/model/transaction-beneficiary';
import { TransactionVoucher } from 'src/app/model/transaction-voucher';

import { TransactionGeneralRelief } from 'src/app/model/transaction-general-relief';
import { finalize } from 'rxjs/operators';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/core/api/user.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { Observable } from 'rxjs';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';
import { NetworkService } from 'src/app/core/api/network.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { Distribution } from 'src/app/model/distribution.new';
import { DistributionBeneficiary } from 'src/app/model/distribution-beneficiary.new';

@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit, DesactivationGuarded {
    public nameComponent = 'distributions';
    // distributionId: number;
    actualDistribution: Distribution;
    loadingExport = false;

    loadingDatas = true;
    loadingDistribution = true;
    transacting = false;

    // Control variables.

    loadingFirstStep = false;
    loadingThirdStep = false;
    loadingFinalStep = false;
    loadingTransaction = false;
    sampleSize = 10;
    extensionTypeStep1 = 'xls';
    extensionTypeStep3 = 'xls';
    extensionTypeTransaction = 'xls';

    loadingAdd: boolean;

    // Entities passed to table components.
    beneficiaryEntity = Beneficiary;
    distributionEntity = DistributionData;
    importedBeneficiaryEntity = ImportedBeneficiary;
    entity: any;
    selection;
    checkedLines: any = [];
    distributed = false;

    // Datas.
    initialBeneficiaryData: MatTableDataSource<Beneficiary>;
    randomSampleData: MatTableDataSource<any>;
    finalBeneficiaryData: MatTableDataSource<Beneficiary>;
    transactionData: MatTableDataSource<any>;

    // Screen display variables.
    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public heightScreen;
    public widthScreen;
    TEXT = GlobalText.TEXTS;
    public language = GlobalText.language;

    // AddBeneficiary Dialog variables.
    beneficiaryForm = new FormControl();
    beneficiaryList = new Array<Beneficiary>();
    selectedBeneficiaries = new Array<Beneficiary>();
    selected = false;

    actualUser = new User();
    hasRights = false;
    hasRightsTransaction = false;
    loaderValidation = false;
    loaderCache = false;

    interval: any;
    correctCode = false;
    progression: number;
    hideSnack = false;

    distributionIsStored = false;

    constructor(
        public distributionService: DistributionService,
        public cacheService: AsyncacheService,
        // private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private beneficiariesService: BeneficiariesService,
        private userService: UserService,
        public snackbar: SnackbarService,
        public mapperService: Mapper,
        private dialog: MatDialog,
        private networkService: NetworkService,
    ) {
    }

    ngOnInit() {
        this.checkSize();
        this.getSelectedDistribution();
        this.checkPermission();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

//     /**
//    * check if the langage has changed
//    */
//     ngDoCheck() {
//         if (this.language !== GlobalText.language) {
//             this.language = GlobalText.language;
//         }
//     }

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

    /**
     * Gets the launched distribution from the cache
     */
    getSelectedDistribution() {
        this.route.params.subscribe(params =>  {
            const distributionId = params.id;
            this.distributionService.getOne(distributionId)
            .subscribe(distribution => { // Get from Back
                if (!distribution || Object.keys(distribution).length === 0) {
                    this.getDistributionFromCache(distributionId);
                    return;
                }

                this.actualDistribution = Distribution.apiToModel(distribution);
                if (this.actualDistribution.get('validated')) {
                    this.getDistributionBeneficiaries('transaction');
                } else {
                this.getDistributionBeneficiaries('initial');
                }
                this.loadingDistribution = false;
                this.cacheService.checkForBeneficiaries(this.actualDistribution).subscribe(
                    (distributionIsStored: boolean) => this.distributionIsStored = distributionIsStored
                );
            });
        });
    }

    private getDistributionFromCache(distributionId) {
        this.cacheService.get(AsyncacheService.DISTRIBUTIONS + '_' + distributionId + '_beneficiaries')
            .subscribe((distribution) => {
                if (distribution) {
                    this.actualDistribution = Distribution.apiToModel(distribution);
                    this.loadingDistribution = false;
                    this.loadingDatas = false;
                    if (this.actualDistribution.get('validated')) {
                        this.formatTransactionTable(this.actualDistribution.get<DistributionBeneficiary[]>('distributionBeneficiaries'));
                    }
                    this.getDistributionBeneficiaries('initial');
                }
            });
    }

    /**
     * Gets the Beneficiaries of the actual distribution to display the table
     */
    getDistributionBeneficiaries(type: string) {
        if (type === 'initial') {
            this.loadingFirstStep = true;
        } else if (type === 'final') {
            this.loadingFinalStep = true;
        } else if (type === 'both') {
            this.loadingFirstStep = true;
            this.loadingFinalStep = true;
        } else if (type === 'transaction') {
            this.loadingTransaction = true;
        }
        this.distributionService.getBeneficiaries(this.actualDistribution.get('id'))
            .subscribe(distributionBeneficiaries => {

                const beneficiaries = this.setDistributionBenefAndGetBenef(distributionBeneficiaries);

                if (type === 'initial') {
                    // Step 1 table
                    this.initialBeneficiaryData = new MatTableDataSource(beneficiaries);
                    this.loadingFirstStep = false;
                } else if (type === 'final') {
                    // Step 4 table
                    this.finalBeneficiaryData = new MatTableDataSource(beneficiaries);
                    this.loadingFinalStep = false;
                } else if (type === 'both') {
                    this.initialBeneficiaryData = new MatTableDataSource(beneficiaries);
                    this.finalBeneficiaryData = new MatTableDataSource(beneficiaries);
                    this.loadingFirstStep = false;
                    this.loadingFinalStep = false;
                } else if (type === 'transaction') {
                    this.formatTransactionTable(this.actualDistribution.get<DistributionBeneficiary[]>('distributionBeneficiaries'));
                }

                if (!this.actualDistribution.get('validated')) {
                    this.generateRandom();
                }

                if (this.loadingDatas === true) {
                    this.loadingDatas = false;
                }
            });

        if (type === 'edit') {
            this.finalBeneficiaryData = this.initialBeneficiaryData;
        }
    }

    setDistributionBenefAndGetBenef(distributionBeneficiaries: any): Beneficiary[] {
        this.actualDistribution.set(
            'distributionBeneficiaries',
            distributionBeneficiaries
                .map((distributionBeneficiariy: any) => DistributionBeneficiary.apiToModel(distributionBeneficiariy)));
        return this.actualDistribution.get<DistributionBeneficiary[]>('distributionBeneficiaries').map(
            (distributionBeneficiariy: any) => distributionBeneficiariy.get('beneficiary')
        );
    }

    /**
     * Store beneficiaries of the distribution in the cache
     */
    storeBeneficiaries() {
        this.loaderCache = true;

        const project = this.actualDistribution.get('project');
        const target = this.actualDistribution.get('type').get<string>('name');

        const distributionBeneficiaries = this.actualDistribution.get<DistributionBeneficiary[]>('distributionBeneficiaries');
        distributionBeneficiaries.forEach((element, i) => {
            element.set('beneficiary', this.initialBeneficiaryData.data[i]);
        });
        this.actualDistribution.set('distributionBeneficiaries', distributionBeneficiaries);

        this.beneficiariesService.getAllFromProject(this.actualDistribution.get('project').get('id'), target)
            .subscribe(
                allBeneficiaries => {
                    if (allBeneficiaries) {
                        // this.beneficiaryList = allBeneficiaries.map((beneficiary: any) => Beneficiary.apiToModel(beneficiary));
                        // this.beneficiaryList = Beneficiaries.formatArray(allBeneficiaries);
                        this.cacheService.storeBeneficiaries(project.modelToApi(), this.actualDistribution.modelToApi(), allBeneficiaries)
                            .pipe(
                                finalize(
                                    () => {
                                        this.loaderCache = false;
                                    }
                                )
                            )
                            .subscribe(
                                () => {
                                    // Data added in cache
                                    if (!this.hideSnack) {
                                        this.snackbar.success(this.TEXT.cache_distribution_added);
                                    }
                                    this.hideSnack = false;
                                }
                            );
                    }
                }
            );

            this.distributionIsStored = true;
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

                                                                ////////////
                                            // FUNCTIONS USED FOR A NON VALIDATED DISTRIBUTION ONLY //
                                                                ////////////

    jumpStep(stepper: MatStepper) {
        stepper.next();
    }

    /**
     * Gets all the beneficiaries of the project to be able to add some to this distribution
     */
    getProjectBeneficiaries() {
        this.loadingAdd = true;
        const target = this.actualDistribution.get('type').get<string>('name');

        this.beneficiariesService.getAllFromProject(this.actualDistribution.get('project').get('id'), target)
            .subscribe(
                allBeneficiaries => {
                    this.loadingAdd = false;
                    if (allBeneficiaries) {
                        this.beneficiaryList = allBeneficiaries.map((beneficiary: any) => Beneficiary.apiToModel(beneficiary));
                    } else {
                        this.cacheService.get(
                            AsyncacheService.PROJECTS + '_' + this.actualDistribution.get('project').get('id') + '_beneficiaries')
                            .subscribe(
                                beneficiaries => {
                                    if (beneficiaries) {
                                        this.beneficiaryList = beneficiaries.map((beneficiary: any) => Beneficiary.apiToModel(beneficiary));
                                    }
                                }
                            );
                    }
                }
            );
    }

    /**
     * Opens a dialog corresponding to the ng-template passed as a parameter
     * @param template
     */
    openDialog(template) {

        const distributionDate = new Date(this.actualDistribution.get('date'));
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

    /**
     * To cancel on a dialog
     */
    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
    }

    /**
     * To confirm on AddBeneficiary dialog
     */
    confirmAdding() {
        this.dialog.closeAll();
        const beneficiariesArray = this.selectedBeneficiaries.map((beneficiary: Beneficiary) => beneficiary.modelToApi());
        this.beneficiariesService.add(this.actualDistribution.get('id'), beneficiariesArray)
            .subscribe(
                success => {
                    if (this.networkService.getStatus()) {
                        this.distributionService.getBeneficiaries(this.actualDistribution.get('id'))
                            .subscribe(
                                distributionBeneficiaries => {
                                    if (distributionBeneficiaries) {
                                        const beneficiaries = this.setDistributionBenefAndGetBenef(distributionBeneficiaries);
                                        this.initialBeneficiaryData = new MatTableDataSource(beneficiaries);
                                    }
                                }
                            );
                        this.snackbar.success(this.TEXT.distribution_beneficiary_added);
                        this.getDistributionBeneficiaries('final');
                    }
                },
                error => {
                    this.snackbar.error(error.error ? error.error : this.TEXT.distribution_beneficiary_not_added);
                });
    }

    /**
     * To confirm on Validation dialog
     */
    confirmValidation() {
        if (this.hasRights) {
            if ((this.finalBeneficiaryData && this.finalBeneficiaryData.data.length > 0) ||
                (this.initialBeneficiaryData && this.initialBeneficiaryData.data.length > 0)) {
                this.loaderValidation = true;
                this.distributionService.setValidation(this.actualDistribution.get('id'))
                    .subscribe(
                        success => {
                            this.actualDistribution.set('validated', true);
                            this.snackbar.success(this.TEXT.distribution_validated);
                            this.getDistributionBeneficiaries('transaction');
                            this.cacheService.get(
                                AsyncacheService.DISTRIBUTIONS + '_' + this.actualDistribution.get('id') + '_beneficiaries')
                                .subscribe(
                                    result => {
                                        if (result) {
                                            this.hideSnack = true;
                                            this.storeBeneficiaries();
                                        }
                                    }
                                );
                            this.loaderValidation = false;
                        },
                        error => {
                            this.actualDistribution.set('validated', false);
                            this.snackbar.error(this.TEXT.distribution_not_validated);
                        }
                    );
            } else {
                this.snackbar.error(this.TEXT.distribution_error_validate);
            }
        } else {
            this.snackbar.error(this.TEXT.distribution_no_right_validate);
        }

        this.dialog.closeAll();
    }


    fileSelected(event) {
        if (event) {
            this.selected = true;
        } else {
            this.selected = false;
        }
    }

    /**
     * Generates a table of random beneficiaries from this distribution (length of table = sample size)
     */
    generateRandom() {
        const sampleLength = this.defineSampleSize();
        this.loadingThirdStep = true;

        if (sampleLength > 0) {
            this.beneficiariesService.getRandom(this.actualDistribution.get('id'), sampleLength)
                .subscribe(
                    response => {
                        const data = response.map((beneficiary: any) => Beneficiary.apiToModel(beneficiary));
                        this.randomSampleData = new MatTableDataSource(data);
                        this.loadingThirdStep = false;
                    }
                );
        }
    }

    /**
     * Defines the number of beneficiaries corresponding of the sampleSize percentage
     */
    defineSampleSize(): number {
        if (this.sampleSize <= 0) {
            this.sampleSize = 0;
        } else if (this.sampleSize >= 100) {
            this.sampleSize = 100;
        }

        if (this.finalBeneficiaryData) {
            return Math.ceil((this.sampleSize / 100) * this.finalBeneficiaryData.data.length);
        } else {
            if (this.initialBeneficiaryData) {
                return Math.ceil((this.sampleSize / 100) * this.initialBeneficiaryData.data.length);
            } else {
                return (1);
            }
        }
    }

     /**
     * Requests Back-end a csv containing the sample to export it
     */
    exportSample() {
        this.loadingExport = true;
        const randomSampleForApi = this.randomSampleData.data.map((beneficiary: Beneficiary) => beneficiary.modelToApi());
        this.distributionService.exportSample(randomSampleForApi, this.extensionTypeStep3).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    /**
     * Handles the csv export of the data table
     */
    export() {
        this.loadingExport = true;
        this.distributionService.export('distribution', this.extensionTypeStep1, this.actualDistribution.get('id')).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    /**
     * Set the export type.
     * @param step
     * @param choice
     */
    setType(step, choice) {
        switch (step) {
            case 1: this.extensionTypeStep1 = choice;
                break;
            case 3: this.extensionTypeStep3 = choice;
                break;
            case 5: this.extensionTypeTransaction = choice;
                break;
            default:
                break;
        }
    }

                                                                ////////////
                                            // FUNCTIONS USED FOR A VALIDATED DISTRIBUTION ONLY //
                                                                ////////////

    private formatTransactionTable(distributionBeneficiaries: DistributionBeneficiary[]) {
        if (this.actualDistribution.get('commodities')[0].get('modality_type').get('name') === 'QR Code Voucher') {
            this.entity = TransactionVoucher;
            this.selection = new SelectionModel<any>(true, []);
        } else if (this.actualDistribution.get('commodities')[0].get('modality_type').get('name') !== 'Mobile Money') {
            this.entity = TransactionGeneralRelief;
            this.selection = new SelectionModel<any>(true, []);
        }
        else if (this.actualDistribution.get('commodities')[0].get('modality_type').get('name') === 'Mobile Money') {
            this.entity = TransactionBeneficiary;
        }

        // TO DO : refacto the transactionStuff models and the corresponding components
        // this.transactionData = new MatTableDataSource(this.entity.formatArray(data, this.actualDistribution.commodities));
        this.loadingTransaction = false;
    }

    // /**
    //  * Calculate commodity distribution quantities & values.
    //  */
    // getAmount(type: string, commodity?: any): number {
    //     let amount: number;

    //     if (!this.transactionData) {
    //         amount = 0;
    //     } else if (type === 'people') {
    //         amount = 0;
    //         this.transactionData.data.forEach(
    //             element => {
    //                 if (element.state === -1 || element.state === -2 || element.state === 0) {
    //                     amount++;
    //                 }
    //             }
    //         );
    //     }
    //     return (amount);
    // }


    // /**
    //  * Get validated distribution type
    //  * @return string
    //  */
    // getDistributionType() {
    //     if (this.actualDistribution.commodities[0].modality_type.name === 'Mobile Money') {
    //         return 'mobile-money';
    //     } else if (this.actualDistribution.commodities[0].modality_type.modality.name === 'In Kind' ||
    //     this.actualDistribution.commodities[0].modality_type.modality.name === 'Other' ||
    //     this.actualDistribution.commodities[0].modality_type.name === 'Paper Voucher') {
    //         return 'general-relief';
    //     } else if (this.actualDistribution.commodities[0].modality_type.name === 'QR Code Voucher') {
    //         return 'qr-voucher';
    //     }
    // }
}
