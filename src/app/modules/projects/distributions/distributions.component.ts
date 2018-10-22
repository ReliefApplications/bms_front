import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { DistributionService } from '../../../core/api/distribution.service';
import { Households } from '../../../model/households';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DistributionData } from '../../../model/distribution-data';
import { CacheService } from '../../../core/storage/cache.service';
import { Beneficiaries } from '../../../model/beneficiary';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { MatTableDataSource, MatSnackBar, MatDialog, MatFormField, MatStepper } from '@angular/material';
import { ExportInterface } from '../../../model/export.interface';
import { saveAs } from 'file-saver/FileSaver';
import { Mapper } from '../../../core/utils/mapper.service';
import { ImportedBeneficiary } from '../../../model/imported-beneficiary';
import { AnimationRendererFactory } from '@angular/platform-browser/animations/src/animation_renderer';
import { TransactionBeneficiary } from '../../../model/transaction-beneficiary';

@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {
    public nameComponent = 'distribution_title';
    distributionId: number;
    actualDistribution = new DistributionData();

    loadingDatas = true;
    loadingDistribution = true;
    transacting = false;

    // Control variables.
    loadingFirstStep: boolean;
    loadingThirdStep: boolean;
    loadingFinalStep: boolean;
    loadingTransaction: boolean;
    enteredEmail: string;
    sampleSize: number; // %
    extensionTypeStep1: string; // 1.xls / 2.csv / 3.ods
    extensionTypeStep3: string; // 1.xls / 2.csv / 3.ods

    // Entities passed to table components.
    beneficiaryEntity = Beneficiaries;
    distributionEntity = DistributionData;
    importedBeneficiaryEntity = ImportedBeneficiary;
    transactionBeneficiaryEntity = TransactionBeneficiary;

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

    // AddBeneficiary Dialog variables.
    beneficiaryForm = new FormControl();
    beneficiaryList = new Array<Beneficiaries>();
    selectedBeneficiary = new Beneficiaries();
    target: string = "";

    // Stepper forms.
    form1: FormGroup;
    form2: FormGroup;
    form3: FormGroup;
    form4: FormGroup;

    constructor(
        public distributionService: DistributionService,
        public cacheService: CacheService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private beneficiariesService: BeneficiariesService,
        public snackBar: MatSnackBar,
        public mapperService: Mapper,
        private dialog: MatDialog,
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
     * Gets the launched distribution from the cache
     */
    getSelectedDistribution() {
        this.distributionService.getOne(this.distributionId)
            .subscribe(
                result => { // Get from Back
                    this.actualDistribution = result;
                    // console.log('Got distribution from back :', this.actualDistribution);

                    if (this.actualDistribution.validated) {
                        this.getDistributionBeneficiaries('transaction');
                    }
                    this.loadingDistribution = false;
                },
                error => {
                    if (!this.actualDistribution) { // Get from Cache
                        const distributionsList: DistributionData[] = this.cacheService.get(CacheService.DISTRIBUTIONS);
                        if (distributionsList) {
                            distributionsList.forEach(element => {
                                if (Number(element.id) === Number(this.distributionId)) {
                                    this.actualDistribution = element;
                                } else {
                                    // console.log('fail');
                                }
                            });
                        }
                        // console.log('Got distribution from cache :', this.actualDistribution, 'because of error : ', error);
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
            .subscribe(
                response => {
                    const data = response;

                    if (type === 'initial') {
                        // Step 1 table
                        // console.log('Getting Initial data');
                        this.initialBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(data));
                        this.loadingFirstStep = false;
                    } else if (type === 'final') {
                        // Step 4 table
                        // console.log('Getting final data');
                        this.finalBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(data));
                        this.loadingFinalStep = false;
                    } else if (type === 'both') {
                        // console.log('Getting both data');
                        const beneficiariesData = Beneficiaries.formatArray(data);
                        this.initialBeneficiaryData = new MatTableDataSource(beneficiariesData);
                        this.finalBeneficiaryData = new MatTableDataSource(beneficiariesData);
                        this.loadingFirstStep = false;
                        this.loadingFinalStep = false;
                    } else if (type === 'transaction') {
                        // console.log('Getting transaction data');
                        this.transactionData = new MatTableDataSource(TransactionBeneficiary.formatArray(data, this.actualDistribution.commodities));
                        this.loadingTransaction = false;
                    }

                    if(!this.actualDistribution.validated) {
                        this.generateRandom();
                    }

                    if (this.loadingDatas == true) {
                        this.loadingDatas = false;
                    }
                },
                error => {
                    // console.log("Error: ", error);
                }
            );

        if (type === 'edit') {
            this.finalBeneficiaryData = this.initialBeneficiaryData;
        }
    }

    /**
     * Gets all the beneficiaries of the project to be able to add some to this distribution
     */
    getProjectBeneficiaries() {
        let allBeneficiaries;

        let entityInstance = Object.create(this.distributionEntity.prototype);
        entityInstance.constructor.apply(entityInstance);
        this.target = entityInstance.getMapperBox(this.actualDistribution).type;

        this.beneficiariesService.getAllFromProject(this.actualDistribution.project.id, this.target)
            .subscribe(
                result => {
                    allBeneficiaries = result;
                    if (allBeneficiaries) {
                        this.beneficiaryList = Beneficiaries.formatArray(allBeneficiaries);
                    } else {
                        // console.log('beneficiaires List is empty');
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
        // console.log('change: ', step, choice);
        switch (step) {
            case 1: this.extensionTypeStep1 = choice;
                break;
            case 3: this.extensionTypeStep3 = choice;
                break;
            default:
                break;
        }
        // console.log("   step1:", this.extensionTypeStep1, "    step3:", this.extensionTypeStep3);
    }

    /**
     * Handles the csv export of the data table
     */
    export() {
        // console.log('type: ', this.extensionTypeStep1);
        this.distributionService.export('distribution', this.extensionTypeStep1, this.distributionId);
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
            return Math.ceil((this.sampleSize / 100) * this.initialBeneficiaryData.data.length);
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
        this.distributionService.exportSample(this.randomSampleData.data, this.extensionTypeStep3);
    }

    /**
     * Opens a dialog corresponding to the ng-template passed as a parameter
     * @param template
     */
    openDialog(template) {
        this.dialog.open(template);
    }

    /**
     * To confirm on Validation dialog
     */
    confirmValidation() {
            this.distributionService.setValidation(this.distributionId)
                .subscribe(
                    success => {
                        this.actualDistribution.validated = true;
                        this.snackBar.open('Distribution has been validated', '', { duration: 3000, horizontalPosition: 'center' });
                        this.validateActualDistributionInCache();
                        this.getDistributionBeneficiaries('transaction');
                        // TODO : Check if phone number exists for all head of households.
                    },
                    error => {
                        this.actualDistribution.validated = false;
                        this.snackBar.open('Distribution could not be validated', '', { duration: 3000, horizontalPosition: 'center' });
                    }
                );

        this.dialog.closeAll();
    }

    /**
     * To transact
     */
    confirmTransaction() {
        const actualUser = this.cacheService.get(CacheService.USER);

        if (this.enteredEmail && actualUser.username === this.enteredEmail) {

            this.transacting = true;
            this.distributionService.transaction(this.distributionId).subscribe(
                success => {
                    this.transactionData.data.forEach(
                        (element, index) => {
                            success.already_sent.push({ id:0 });
                            success.sent.push({ id:0 });

                            success.already_sent.forEach(
                                beneficiary => {
                                    if(element.id === beneficiary.id) {
                                        this.transactionData.data[index].updateState('Already sent');
                                    }
                                }
                            )
                            success.failure.forEach(
                                beneficiary => {
                                    if(element.id === beneficiary.id) {
                                        this.transactionData.data[index].updateState('Sending failed');
                                    }
                                }
                            )
                            success.no_mobile.forEach(
                                beneficiary => {
                                    if(element.id === beneficiary.id) {
                                        this.transactionData.data[index].updateState('No phone');
                                    }
                                }
                            )
                            success.sent.forEach(
                                beneficiary => {
                                    if(element.id === beneficiary.id) {
                                        this.transactionData.data[index].updateState('Sent');
                                    }
                                }
                            )
                        }
                    );
                    this.transacting = false;
                },
                error => {
                    this.transacting = false;
                }
            )

        } else {
            this.snackBar.open('Wrong email', '', { duration: 3000, horizontalPosition: 'center' });
        }

        this.dialog.closeAll();
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
                this.cacheService.set(CacheService.DISTRIBUTIONS, newDistributionsList);
            },
                error => {
                    // console.log('could not refresh :', error);
                });
    }

    /**
     * To confirm on AddBeneficiary dialog
     */
    confirmAdding() {
        this.dialog.closeAll();

        this.beneficiariesService.add(this.distributionId, Beneficiaries.formatForApi(this.selectedBeneficiary))
            .subscribe(
                success => {
                    this.distributionService.getBeneficiaries(this.distributionId)
                        .subscribe(
                            response => {
                                this.initialBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(response));
                            }
                        );
                    this.snackBar.open('Beneficiary added', '', { duration: 3000, horizontalPosition: 'center' });
                    this.getDistributionBeneficiaries('final');
                },
                error => {
                    // console.log('cc', this.selectedBeneficiary);
                    this.snackBar.open('Beneficiary could not be added', '', { duration: 3000, horizontalPosition: 'center' });
                });
    }

    /**
     * To cancel on a dialog
     */
    exit(message: string) {
        this.snackBar.open(message, '', { duration: 3000, horizontalPosition: 'center' });
        this.dialog.closeAll();
    }

    /**
     * Calculate commodity distribution quantities & values.
     */
    getAmmount(type: string, commodity?: any) : number {

        let ammount: number;

        if(!this.transactionData) {
            ammount = 0;
        } else if (type === 'people') {
            ammount = 0;
            this.transactionData.data.forEach(
                element => {
                    if(element.state === -1 || element.state === -2 || element.state === 0) {
                        ammount++;
                    }
                }
            )
        } else if(commodity) {

            if(type === 'total') {
                ammount = commodity.value * this.transactionData.data.length;
            } else if(type === 'done') {
                ammount = 0;
                this.transactionData.data.forEach(
                    element => {
                        if(element.state === 1 || element.state === 2) {
                            ammount += commodity.value;
                        }
                    }
                );
            } else if(type === 'waiting') {
                ammount = 0;
                this.transactionData.data.forEach(
                    element => {
                        if(element.state === -2 ||element.state === -1 || element.state === 0) {
                            ammount += commodity.value;
                        }
                    }
                );
            } else if (type === 'ratio') {
                let done = 0;
                this.transactionData.data.forEach(
                    element => {
                        if(element.state === 1 || element.state === 2) {
                            done += commodity.value;
                        }
                    }
                );
                ammount = Math.round( ( done / (commodity.value * this.transactionData.data.length) )*100 );
            }
        }
        // console.log(type, ammount);

        return(ammount);
    }

    jumpStep(stepper : MatStepper) {
        stepper.next();
    }

}
