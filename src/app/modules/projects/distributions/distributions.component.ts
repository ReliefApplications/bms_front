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
import { AnimationRendererFactory } from '@angular/platform-browser/animations/src/animation_renderer';

@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {

    distributionId: number;
    actualDistribution: any;

    // Control variables.
    loadingFirstStep: boolean;
    loadingThirdStep: boolean;
    loadingFinalStep: boolean;
    enteredEmail: string;

    // Entities passed to table components.
    beneficiaryEntity = Beneficiaries;
    distributionEntity = DistributionData;

    // Datas.
    initialBeneficiaryData: MatTableDataSource<any>;
    importedData: any;
    randomSampleData: MatTableDataSource<any>;
    finalBeneficiaryData: MatTableDataSource<any>;

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
        this.loadingFirstStep = false;
        this.loadingThirdStep = false;
        this.loadingFinalStep = false;

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
        this.updateSteps();
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
     * Updates the value of the beneficiaries tables from step to step
     **/
    updateSteps() {
        this.generateRandom();
        this.getDistributionBeneficiaries('initial');
    }

    /**
     * Gets the launched distribution from the cache
     */
    getSelectedDistribution() {
        this.distributionService.getOne(this.distributionId)
        .subscribe(
            result => { // Get from Back
                this.actualDistribution = result.json();
                // console.log('Got distribution from back :', this.actualDistribution);
            }
        );
        if (!this.actualDistribution) { // Get from Cache
            let distributionsList = this.cacheService.get(CacheService.DISTRIBUTIONS);
            distributionsList = JSON.parse(distributionsList._body);

            if (distributionsList) {
                distributionsList.forEach(element => {
                    if (Number(element.id) === Number(this.distributionId)) {
                        this.actualDistribution = element;
                    } else {
                        // console.log('fail');
                    }
                });
            }
            // console.log('Got distribution from cache :', this.actualDistribution);
        }
    }

    /**
     * Gets the Beneficiaries of the actual distribution to display the table
     */
    getDistributionBeneficiaries(type: string) {
        if (type === 'initial') {
            this.loadingFirstStep = true;
        } else if (type === 'final') {
            this.loadingFinalStep = true;
        }
        this.distributionService.getBeneficiaries(this.distributionId)
            .subscribe(
                response => {
                    const data = response.json();

                    if (type === 'initial') {
                        // Step 1 table
                        this.initialBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(data));
                        this.loadingFirstStep = false;
                    } else if (type === 'final') {
                        // Step 4 table
                        this.finalBeneficiaryData = new MatTableDataSource(Beneficiaries.formatArray(data));
                        this.loadingFinalStep = false;
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

        this.beneficiariesService.getAllFromProject(this.actualDistribution.project.id)
            .subscribe(
                result => {
                    allBeneficiaries = result.json();

                    if (allBeneficiaries) {
                        this.beneficiaryList = Beneficiaries.formatArray(allBeneficiaries);
                    } else {
                        // console.log('beneficiaires List is empty');
                    }
                }
            );
    }

    /**
     * Handles the csv export of the data table
     */
    export() {
        this.distributionService.export('distribution', this.distributionId).toPromise()
            .then(response => {
                const arrExport = [];
                const reponse: ExportInterface = response.json() as ExportInterface;

                if (!(reponse instanceof Object)) {
                    this.snackBar.open('No data to export', '', { duration: 3000, horizontalPosition: 'right' });
                } else {
                    arrExport.push(reponse.content);
                    const blob = new Blob(arrExport, { type: 'text/csv' });
                    saveAs(blob, reponse.filename);
                }
            })
            .catch(error => {
                this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: 'right' });
            });
    }

    /**
     * Generates a table of 10 random beneficiaries from this distribution
     */
    generateRandom() {
        this.loadingThirdStep = true;
        this.beneficiariesService.getRandom(this.distributionId)
            .subscribe(
                response => {
                    const data = response.json();
                    // console.log("random: ",data);
                    this.randomSampleData = new MatTableDataSource(Beneficiaries.formatArray(data));
                }
            );
        this.loadingThirdStep = false;
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
        const actualUser = this.cacheService.get(CacheService.USER);

        if (this.enteredEmail && actualUser.username === this.enteredEmail) {

            this.distributionService.setValidation(this.distributionId)
                .subscribe(
                    success => {
                        this.actualDistribution.validated = true;
                        this.snackBar.open('Distribution has been validated', '', { duration: 3000, horizontalPosition: 'center' });
                        this.validateActualDistributionInCache();
                    },
                    error => {
                        this.actualDistribution.validated = false;
                        this.snackBar.open('Distribution could not be validated', '', { duration: 3000, horizontalPosition: 'center' });
                    }
                );
        } else {
            this.snackBar.open('Wrong email', '', { duration: 3000, horizontalPosition: 'center' });
        }

        this.dialog.closeAll();
    }

    validateActualDistributionInCache() {

        const newDistributionsList = new Array<DistributionData>();
        this.distributionService.get()
            .subscribe( result => {
                const oldDistributionsList = result.json();
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
     * To cancel on Validation dialog
     */
    exitValidation() {
        this.snackBar.open('Transaction canceled', '', { duration: 3000, horizontalPosition: 'center' });
        this.dialog.closeAll();
    }

    /**
     * To confirm on AddBeneficiary dialog
     */
    confirmAdding() {
        this.dialog.closeAll();

        this.beneficiariesService.add(this.distributionId, Beneficiaries.formatForApi(this.selectedBeneficiary))
            .subscribe(
                success => {
                    this.snackBar.open('Beneficiary added', '', { duration: 3000, horizontalPosition: 'center' });
                    this.getDistributionBeneficiaries('final');
                },
                error => {
                    this.snackBar.open('Beneficiary could not be added', '', { duration: 3000, horizontalPosition: 'center' });
                });
    }

    /**
     * To cancel on AddBeneficiary dialog
     */
    exitAdding() {
        this.dialog.closeAll();
        this.snackBar.open('Adding canceled', '', { duration: 3000, horizontalPosition: 'center' });
    }

    goBackToBeginning(stepper: MatStepper) {
        for (let i = 0; i < 3; i++) {
            stepper.previous();
        }
    }

}
