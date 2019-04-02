import { SelectionModel } from '@angular/cdk/collections';
import { Component, DoCheck, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatStepper, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { NetworkService } from 'src/app/core/api/network.service';
import { UserService } from 'src/app/core/api/user.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Mapper } from 'src/app/core/utils/mapper.service';
import { Beneficiaries } from 'src/app/model/beneficiary';
import { DistributionData } from 'src/app/model/distribution-data';
import { ImportedBeneficiary } from 'src/app/model/imported-beneficiary';
import { TransactionBeneficiary } from 'src/app/model/transaction-beneficiary';
import { TransactionGeneralRelief } from 'src/app/model/transaction-general-relief';
import { TransactionVoucher } from 'src/app/model/transaction-voucher';
import { User } from 'src/app/model/user';
import { GlobalText } from 'src/texts/global';


@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit, DesactivationGuarded, DoCheck {
    public nameComponent = 'distributions';
    distributionId: number;
    actualDistribution = new DistributionData();
    loadingExport = false;

    loadingDatas = true;
    loadingDistribution = true;
    transacting = false;

    // Control variables.
    loadingFirstStep: boolean;
    loadingThirdStep: boolean;
    loadingFinalStep: boolean;
    loadingTransaction: boolean;
    loadingAdd: boolean;
    sampleSize: number; // %
    extensionTypeStep1: string; // 1.xls / 2.csv / 3.ods
    extensionTypeStep3: string; // 1.xls / 2.csv / 3.ods
    extensionTypeTransaction: string; // 1.xls / 2.csv / 3.ods

    // Entities passed to table components.
    beneficiaryEntity = Beneficiaries;
    distributionEntity = DistributionData;
    importedBeneficiaryEntity = ImportedBeneficiary;
    entity: any;
    selection;
    checkedLines: any = [];
    distributed = false;

    // Datas.
    initialBeneficiaryData: MatTableDataSource<any>;
    randomSampleData: MatTableDataSource<any>;
    finalBeneficiaryData: MatTableDataSource<any>;
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
    beneficiaryList = new Array<Beneficiaries>();
    selectedBeneficiaries = new Array<Beneficiaries>();
    target = '';
    selected = false;

    // Stepper forms.
    form1: FormGroup;
    form2: FormGroup;
    form3: FormGroup;
    form4: FormGroup;

    actualUser = new User();
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
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private beneficiariesService: BeneficiariesService,
        private userService: UserService,
        public snackbar: SnackbarService,
        public mapperService: Mapper,
        private dialog: MatDialog,
        private networkService: NetworkService,
    ) {
        this.route.params.subscribe(params => this.distributionId = params.id);
    }

    ngOnInit() {
        this.checkSize();
        this.actualDistribution.validated = true;
        this.loadingFirstStep = false;
        this.loadingThirdStep = false;
        this.loadingFinalStep = false;
        this.loadingTransaction = false;
        this.sampleSize = 10;
        this.extensionTypeStep1 = 'xls';
        this.extensionTypeStep3 = 'xls';
        this.extensionTypeTransaction = 'xls';

        // Steps Forms.
        this.form1 = this.formBuilder.group({
        });
        this.form2 = this.formBuilder.group({
        });
        this.form3 = this.formBuilder.group({
        });
        this.form4 = this.formBuilder.group({
        });

        this.getSelectedDistribution();

        this.getDistributionBeneficiaries('initial');
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    /**
   * check if the langage has changed
   */
    ngDoCheck() {
        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
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

    /**
     * Get validated distribution type
     * @return string
     */
    getDistributionType() {
        if (this.actualDistribution.commodities[0].modality_type.name === 'Mobile Money') {
            return 'mobile-money';
        } else if (this.actualDistribution.commodities[0].modality_type.modality.name === 'In Kind' ||
        this.actualDistribution.commodities[0].modality_type.modality.name === 'Other' ||
        this.actualDistribution.commodities[0].modality_type.name === 'Paper Voucher') {
            return 'general-relief';
        } else if (this.actualDistribution.commodities[0].modality_type.name === 'QR Code Voucher') {
            return 'qr-voucher';
        }
    }

    /**
     * Gets the launched distribution from the cache
     */
    getSelectedDistribution() {
        this.distributionService.getOne(this.distributionId)
            .subscribe(distribution => { // Get from Back
                if (!distribution || Object.keys(distribution).length === 0) {
                    this.getDistributionFromCache();
                    return;
                }

                this.actualDistribution = distribution;
                if (this.actualDistribution.validated) {
                    this.getDistributionBeneficiaries('transaction');
                }
                this.loadingDistribution = false;
                this.cacheService.checkForBeneficiaries(this.actualDistribution).subscribe(
                    (distributionIsStored: boolean) => this.distributionIsStored = distributionIsStored
                );
            });
    }

    private getDistributionFromCache() {
        this.cacheService.get(AsyncacheService.DISTRIBUTIONS + '_' + this.distributionId + '_beneficiaries')
            .subscribe((actualDistribution: DistributionData) => {
                if (actualDistribution) {
                    this.actualDistribution = actualDistribution;
                    this.loadingDistribution = false;
                    this.loadingDatas = false;
                    if (this.actualDistribution.validated) {
                        this.formatTransactionTable(this.actualDistribution.distribution_beneficiaries);
                    }
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
        this.distributionService.getBeneficiaries(this.distributionId)
            .subscribe(response => {
                let data: any;
                if (response && response.id) {
                    this.actualDistribution = response;
                    data = response.distribution_beneficiaries;
                } else {
                    this.actualDistribution.distribution_beneficiaries = response;
                    data = response;
                }

                if (type === 'initial') {
                    // Step 1 table
                    this.initialBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(data));
                    this.loadingFirstStep = false;
                } else if (type === 'final') {
                    // Step 4 table
                    this.finalBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(data));
                    this.loadingFinalStep = false;
                } else if (type === 'both') {
                    const beneficiariesData = Beneficiaries.formatArray(data);
                    this.initialBeneficiaryData = new MatTableDataSource(beneficiariesData);
                    this.finalBeneficiaryData = new MatTableDataSource(beneficiariesData);
                    this.loadingFirstStep = false;
                    this.loadingFinalStep = false;
                } else if (type === 'transaction') {
                    this.formatTransactionTable(data);
                }

                if (!this.actualDistribution.validated) {
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

    private formatTransactionTable(data: any) {
        if (this.actualDistribution.commodities[0].modality_type.name === 'QR Code Voucher') {
            this.entity = TransactionVoucher;
            this.selection = new SelectionModel<any>(true, []);
        } else if (this.actualDistribution.commodities[0].modality_type.name !== 'Mobile Money') {
            this.entity = TransactionGeneralRelief;
            this.selection = new SelectionModel<any>(true, []);
        }
        else if (this.actualDistribution.commodities[0].modality_type.name === 'Mobile Money') {
            this.entity = TransactionBeneficiary;
        }
        this.transactionData = new MatTableDataSource(this.entity.formatArray(data, this.actualDistribution.commodities));
        this.loadingTransaction = false;
    }

    /**
     * Gets all the beneficiaries of the project to be able to add some to this distribution
     */
    getProjectBeneficiaries() {
        let allBeneficiaries;
        this.loadingAdd = true;
        const entityInstance = Object.create(this.distributionEntity.prototype);
        entityInstance.constructor.apply(entityInstance);
        this.target = entityInstance.getMapperBox(this.actualDistribution).type;

        this.beneficiariesService.getAllFromProject(this.actualDistribution.project.id, this.target)
            .subscribe(
                result => {
                    this.loadingAdd = false;
                    allBeneficiaries = result;
                    if (allBeneficiaries) {
                        this.beneficiaryList = Beneficiaries.formatArray(allBeneficiaries);
                    } else {
                        this.cacheService.get(AsyncacheService.PROJECTS + '_' + this.actualDistribution.project.id + '_beneficiaries')
                            .subscribe(
                                beneficiaries => {
                                    if (beneficiaries) {
                                        allBeneficiaries = beneficiaries;
                                        this.beneficiaryList = Beneficiaries.formatArray(allBeneficiaries);
                                    }
                                }
                            );
                    }
                }
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

    /**
     * Handles the csv export of the data table
     */
    export() {
        this.loadingExport = true;
        this.distributionService.export('distribution', this.extensionTypeStep1, this.distributionId).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    fileSelected(event) {
        if (event) {
            this.selected = true;
        } else {
            this.selected = false;
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
     * Generates a table of random beneficiaries from this distribution (length of table = sample size)
     */
    generateRandom() {
        const sampleLength = this.defineSampleSize();
        this.loadingThirdStep = true;

        if (sampleLength > 0) {
            this.beneficiariesService.getRandom(this.distributionId, sampleLength)
                .subscribe(
                    response => {
                        const data = Beneficiaries.formatArray(response);
                        this.randomSampleData = new MatTableDataSource(data);
                        this.loadingThirdStep = false;
                    }
                );
        }
    }

    /**
     * Requests Back-end a csv containing the sample to export it
     */
    exportSample() {
        this.loadingExport = true;
        this.distributionService.exportSample(this.randomSampleData.data, this.extensionTypeStep3).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    exportInformation(template) {
        this.dialog.open(template);
    }

    /**
     * Opens a dialog corresponding to the ng-template passed as a parameter
     * @param template
     */
    openDialog(template) {
        const distributionDate = new Date(this.actualDistribution.date_distribution);
        if (new Date() < distributionDate) {
            this.dialog.open(template);
        } else {
            this.snackbar.error(GlobalText.TEXTS.snackbar_invalid_transaction_date);
        }
    }

    /**
     * To confirm on Validation dialog
     */
    confirmValidation() {
        if (this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT')) {
            if ((this.finalBeneficiaryData && this.finalBeneficiaryData.data.length > 0) ||
                (this.initialBeneficiaryData && this.initialBeneficiaryData.data.length > 0)) {
                this.loaderValidation = true;
                this.distributionService.setValidation(this.distributionId)
                    .subscribe(
                        success => {
                            this.actualDistribution.validated = true;
                            this.snackbar.success(this.TEXT.distribution_validated);
                            this.validateActualDistributionInCache();
                            this.getDistributionBeneficiaries('transaction');
                            this.cacheService.get(AsyncacheService.DISTRIBUTIONS + '_' + this.actualDistribution.id + '_beneficiaries')
                                .subscribe(
                                    result => {
                                        if (result) {
                                            this.hideSnack = true;
                                            this.storeBeneficiaries();
                                        }
                                    }
                                );
                            this.loaderValidation = false;
                            // TODO : Check if phone number exists for all head of households.
                        },
                        error => {
                            this.actualDistribution.validated = false;
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

    setTransactionMessage(beneficiary, i) {

        this.transactionData.data[i].message = beneficiary.transactions[beneficiary.transactions.length - 1].message ?
            beneficiary.transactions[beneficiary.transactions.length].message : '';
    }

    /**
     * Refresh the cache with the validated distribution
     */
    validateActualDistributionInCache() {
        const newDistributionsList = new Array<DistributionData>();
        this.distributionService.get()
            .subscribe(result => {
                const oldDistributionsList = result;
                oldDistributionsList.forEach(
                    element => {
                        const distrib = element;

                        if (Number(element.id) === Number(this.distributionId)) {
                            distrib.validated = true;
                        }

                        newDistributionsList.push(distrib);
                    }
                );
            });
    }

    /**
     * To confirm on AddBeneficiary dialog
     */
    confirmAdding() {
        this.dialog.closeAll();

        const beneficiariesArray = new Array();
        this.selectedBeneficiaries.forEach(
            element => {
                beneficiariesArray.push(Beneficiaries.formatForApi(element));
            }
        );

        this.beneficiariesService.add(this.distributionId, beneficiariesArray)
            .subscribe(
                success => {
                    if (this.networkService.getStatus()) {
                        this.distributionService.getBeneficiaries(this.distributionId)
                            .subscribe(
                                response => {
                                    if (response) {
                                        this.initialBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(response));
                                    }
                                }
                            );
                        this.snackbar.success(this.TEXT.distribution_beneficiary_added);
                        this.getDistributionBeneficiaries('final');
                    }
                },
                error => {
                    this.snackbar.error(this.TEXT.distribution_beneficiary_not_added);
                });
    }

    /**
     * To cancel on a dialog
     */
    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
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
        }
        return (amount);
    }

    jumpStep(stepper: MatStepper) {
        stepper.next();
    }

    /**
     * Store beneficiaries of the distribution in the cache
     */
    storeBeneficiaries() {
        this.loaderCache = true;

        const project = this.actualDistribution.project;

        this.actualDistribution.distribution_beneficiaries.forEach((element, i) => {
            element.beneficiary = this.initialBeneficiaryData.data[i];
        });
        const distribution = this.actualDistribution;

        let allBeneficiaries;

        const entityInstance = Object.create(this.distributionEntity.prototype);
        entityInstance.constructor.apply(entityInstance);
        this.target = entityInstance.getMapperBox(this.actualDistribution).type;

        this.beneficiariesService.getAllFromProject(this.actualDistribution.project.id, this.target)
            .subscribe(
                result => {
                    allBeneficiaries = result;
                    if (allBeneficiaries) {
                        this.beneficiaryList = Beneficiaries.formatArray(allBeneficiaries);
                        this.cacheService.storeBeneficiaries(project, distribution, this.beneficiaryList)
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
}
