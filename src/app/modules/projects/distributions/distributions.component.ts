import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { DistributionService } from '../../../core/api/distribution.service';
import { Households } from '../../../model/households';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DistributionData } from '../../../model/distribution-data';
import { Beneficiaries } from '../../../model/beneficiary';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { MatTableDataSource, MatSnackBar, MatDialog, MatFormField, MatStepper } from '@angular/material';
import { ExportInterface } from '../../../model/export.interface';
import { saveAs } from 'file-saver/FileSaver';
import { Mapper } from '../../../core/utils/mapper.service';
import { ImportedBeneficiary } from '../../../model/imported-beneficiary';
import { AnimationRendererFactory } from '@angular/platform-browser/animations/src/animation_renderer';
import { TransactionBeneficiary } from '../../../model/transaction-beneficiary';
import { finalize, last, map } from 'rxjs/operators';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/core/api/user.service';
import { element } from '@angular/core/src/render3/instructions';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { Observable } from 'rxjs';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';

@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit, DesactivationGuarded {
    public nameComponent = 'distribution_title';
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
    public language = GlobalText.language;

    // AddBeneficiary Dialog variables.
    beneficiaryForm = new FormControl();
    beneficiaryList = new Array<Beneficiaries>();
    selectedBeneficiaries = new Array<Beneficiaries>();
    target: string = "";

    // Stepper forms.
    form1: FormGroup;
    form2: FormGroup;
    form3: FormGroup;
    form4: FormGroup;

    // Transaction.
    readonly SENDING_CODE_FREQ = 10000; //ms
    lastCodeSentTime = 0; //ms
    actualUser = new User();
    enteredCode = '';
    chartAccepted = false;

    hasRights: boolean = false;
    hasRightsTransaction: boolean = false;

    constructor(
        public distributionService: DistributionService,
        public cacheService: AsyncacheService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private beneficiariesService: BeneficiariesService,
        private userService: UserService,
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
        this.checkPermission();

    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        // console.log('resize');
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    /**
   * check if the langage has changed
   */
    ngDoCheck() {
        if (this.language !== GlobalText.language)
            this.language = GlobalText.language;
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
     * Gets the launched distribution from the cache
     */
    getSelectedDistribution() {
        this.distributionService.getOne(this.distributionId)
            .subscribe(
                result => { // Get from Back
                    this.actualDistribution = result;
                    if (!this.actualDistribution) {
                        // console.log('fail');
                        // // Particular case to search in cache distribution list if there is no api response.
                        // this.cacheService.get(AsyncacheService.DISTRIBUTIONS)
                        // .subscribe(
                        //     (result: any[]) => {
                        //         if(result) {
                        //             result.forEach( element => {
                        //                 if(element.id === this.distributionId) {
                        //                     this.actualDistribution = element;
                        //                 }
                        //             });
                        //         }
                        //     }
                        // );
                    }
                    if (this.actualDistribution.validated) {
                        this.getDistributionBeneficiaries('transaction');
                    }
                    this.loadingDistribution = false;
                },
                error => {
                }
            );
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
                        this.refreshStatuses();
                        this.loadingTransaction = false;
                    }

                    if (!this.actualDistribution.validated) {
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
        this.loadingExport = true;
        // console.log('type: ', this.extensionTypeStep1);
        this.distributionService.export('distribution', this.extensionTypeStep1, this.distributionId).then(
            () => { this.loadingExport = false }
        ).catch(
            () => { this.loadingExport = false }
        )
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
            if (this.initialBeneficiaryData)
                return Math.ceil((this.sampleSize / 100) * this.initialBeneficiaryData.data.length);
            else
                return (1);
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
            () => { this.loadingExport = false }
        ).catch(
            () => { this.loadingExport = false }
        )
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
        if (this.hasRights) {
            this.distributionService.setValidation(this.distributionId)
                .subscribe(
                    success => {
                        this.actualDistribution.validated = true;
                        this.snackBar.open(this.TEXT.distribution_validated, '', { duration: 5000, horizontalPosition: 'center' });
                        this.validateActualDistributionInCache();
                        this.getDistributionBeneficiaries('transaction');
                        // TODO : Check if phone number exists for all head of households.
                    },
                    error => {
                        this.actualDistribution.validated = false;
                        this.snackBar.open(this.TEXT.distribution_not_validated, '', { duration: 5000, horizontalPosition: 'center' });
                    }
                );

        }
        else
            this.snackBar.open(this.TEXT.distribution_no_right_validate, '', { duration: 5000, horizontalPosition: 'right' });

        this.dialog.closeAll();
    }

    codeVerif() {
        if ((new Date()).getTime() - this.lastCodeSentTime > this.SENDING_CODE_FREQ) {
            this.distributionService.sendCode(this.distributionId).toPromise()
            .then(
                anwser => {
                    if(anwser === "Email sent") {
                        this.lastCodeSentTime = (new Date()).getTime();
                        this.snackBar.open('Verification code has been sent at ' + this.actualUser.email, '', { duration: 5000, horizontalPosition: 'center' });
                    }
                },
                () => {
                    this.lastCodeSentTime = (new Date()).getTime();
                    this.snackBar.open('Verification code has been sent at ' + this.actualUser.email, '', { duration: 5000, horizontalPosition: 'center' });
                }
            )
            .catch(
                (err) => {
                    this.snackBar.open('Could not send code :' + err, '', { duration: 5000, horizontalPosition: 'center' });
                }
            );
        } else {
            this.snackBar.open('The last code was sent less than 10 seconds ago, you should wait.', '', { duration: 5000, horizontalPosition: 'center' });
        }
    }

    /**
     * To transact
     */
    confirmTransaction() {
        if (this.hasRightsTransaction) {
            this.cacheService.getUser().subscribe(
                result => {
                    this.actualUser = result;
                    if (this.actualDistribution.commodities && this.actualDistribution.commodities[0]) {
                        this.transacting = true;
                        this.distributionService.transaction(this.distributionId, this.enteredCode)
                            .pipe(
                                finalize(
                                    () => this.transacting = false
                                )
                            ).toPromise().then(
                                success => {
                                    if (this.transactionData) {
                                        this.transactionData.data.forEach(
                                            (element, index) => {
                                                //success.already_sent.push({ id:0 });
                                                //success.sent.push({ id:0 });

                                                success.already_sent.forEach(
                                                    beneficiary => {
                                                        if (element.id === beneficiary.beneficiary.id) {
                                                            this.transactionData.data[index].updateState('Already sent');
                                                            this.setTransactionMessage(beneficiary, index);
                                                        }
                                                    }
                                                )
                                                success.failure.forEach(
                                                    beneficiary => {
                                                        if (element.id === beneficiary.beneficiary.id) {
                                                            this.transactionData.data[index].updateState('Sending failed');
                                                            this.setTransactionMessage(beneficiary, index);
                                                        }
                                                    }
                                                )
                                                success.no_mobile.forEach(
                                                    beneficiary => {
                                                        if (element.id === beneficiary.beneficiary.id) {
                                                            this.transactionData.data[index].updateState('No phone');
                                                            this.setTransactionMessage(beneficiary, index);
                                                        }
                                                    }
                                                )
                                                success.sent.forEach(
                                                    beneficiary => {
                                                        if (element.id === beneficiary.beneficiary.id) {
                                                            this.transactionData.data[index].updateState('Sent');
                                                            this.setTransactionMessage(beneficiary, index);
                                                        }
                                                    }
                                                )
                                            }
                                        );
                                    }
                                }
                            ).catch(
                                //err
                            )
                    } else {
                        this.snackBar.open(this.TEXT.distribution_no_valid_commodity, '', { duration: 5000, horizontalPosition: 'center' });
                    }
                }
            );
        }
        else
            this.snackBar.open(this.TEXT.distribution_no_right_transaction, '', { duration: 5000, horizontalPosition: 'right' });

        this.chartAccepted = false;
        this.dialog.closeAll();
    }

    setTransactionMessage(beneficiary, i) {
         
        this.transactionData.data[i].message = beneficiary.transactions[beneficiary.transactions.length-1].message ?
            beneficiary.transactions[beneficiary.transactions.length].message : '';
    }

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
                                            this.transactionData.data[index].updateForPickup(element.moneyReceived)
                                        }
                                    }
                                );
                            }
                        }
                    )
                }
            }
        );
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

        let beneficiariesArray = new Array();
        this.selectedBeneficiaries.forEach(
            element => {
                beneficiariesArray.push(Beneficiaries.formatForApi(element));
            }
        )

        this.beneficiariesService.add(this.distributionId, beneficiariesArray)
            .subscribe(
                success => {
                    this.distributionService.getBeneficiaries(this.distributionId)
                        .subscribe(
                            response => {
                                this.initialBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(response));
                            }
                        );
                    this.snackBar.open(this.TEXT.distribution_beneficiary_added, '', { duration: 5000, horizontalPosition: 'center' });
                    this.getDistributionBeneficiaries('final');
                },
                error => {
                    // console.log('cc', this.selectedBeneficiaries);
                    this.snackBar.open(this.TEXT.distribution_beneficiary_not_added, '', { duration: 5000, horizontalPosition: 'center' });
                });
    }

    /**
     * To cancel on a dialog
     */
    exit(message: string) {
        this.snackBar.open(message, '', { duration: 5000, horizontalPosition: 'center' });
        this.chartAccepted = false;
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
            )
        } else if (commodity) {

            if (type === 'total') {
                amount = commodity.value * this.transactionData.data.length;
            } else if (type === 'done') {
                amount = 0;
                this.transactionData.data.forEach(
                    element => {
                        if (element.state === 1 || element.state === 2) {
                            amount += commodity.value;
                        }
                    }
                );
            } else if (type === 'waiting') {
                amount = 0;
                this.transactionData.data.forEach(
                    element => {
                        if (element.state === -2 || element.state === -1 || element.state === 0) {
                            amount += commodity.value;
                        }
                    }
                );
            } else if (type === 'ratio') {
                let done = 0;
                this.transactionData.data.forEach(
                    element => {
                        if (element.state === 1 || element.state === 2) {
                            done += commodity.value;
                        }
                    }
                );
                amount = Math.round((done / (commodity.value * this.transactionData.data.length)) * 100);
            }
        }
        // console.log(type, amount);

        return (amount);
    }

    jumpStep(stepper: MatStepper) {
        stepper.next();
    }

    requestLogs() {
        if (this.hasRights) {
            try {
                this.distributionService.logs(this.distributionId).subscribe(
                    e => { this.snackBar.open(''+e, '', { duration: 5000, horizontalPosition: 'center' }); },
                    () => { this.snackBar.open('Logs have been sent', '', { duration: 5000, horizontalPosition: 'center' }); },
                )
            } catch(e) {
                this.snackBar.open('Logs could not be sent : ' +e, '', { duration: 5000, horizontalPosition: 'center' });        
            }
        } else {
            this.snackBar.open('Not enough rights to request logs', '', { duration: 5000, horizontalPosition: 'center' });
        }
    }

    checkPermission() {
        this.cacheService.getUser().subscribe(
            result => {
                this.setUser(result.user_id);
                if (result && result.voters) {
                    const voters = result.voters;
                    if (voters == "ROLE_ADMIN" || voters == 'ROLE_PROJECT_MANAGER')
                        this.hasRights = true;

                    if (voters == "ROLE_ADMIN" || voters == 'ROLE_PROJECT_MANAGER' || voters == 'ROLE_COUNTRY_MANAGER')
                        this.hasRightsTransaction = true;
                }
            }
        )
    }

    setUser(userId) {
        this.userService.get().subscribe(
            result => {
                if (result) {
                    result.forEach(
                        element => {
                            if (element.id === userId) {
                                this.actualUser = element;
                            }
                        }
                    )
                }
            }
        )
    }
}
