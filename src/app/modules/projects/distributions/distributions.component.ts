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
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { Distribution } from 'src/app/model/distribution.new';
import { DistributionBeneficiary } from 'src/app/model/distribution-beneficiary.new';
import { TransactionMobileMoney, State } from 'src/app/model/transaction-mobile-money.new';

@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {
    public nameComponent = 'distributions';
    // distributionId: number;
    actualDistribution: Distribution;
    loadingExport = false;
    distributionFinished = false;
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
    checkedLines: any = [];
    distributed = false;

    // Datas.
    initialBeneficiaryData: MatTableDataSource<Beneficiary>;
    randomSampleData: MatTableDataSource<any>;
    finalBeneficiaryData: MatTableDataSource<Beneficiary>;

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
        // this.checkSize();
        this.getSelectedDistribution();
        // this.checkPermission();
    }

//     @HostListener('window:resize', ['$event'])
//     onResize(event) {
//         this.checkSize();
//     }

//     checkSize(): void {
//         this.heightScreen = window.innerHeight;
//         this.widthScreen = window.innerWidth;
//     }

// //     /**
// //    * check if the langage has changed
// //    */
// //     ngDoCheck() {
// //         if (this.language !== GlobalText.language) {
// //             this.language = GlobalText.language;
// //         }
// //     }

//     /**
//   * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
//   */
//     @HostListener('window:beforeunload')
//     canDeactivate(): Observable<boolean> | boolean {
//         if (this.transacting) {
//             const dialogRef = this.dialog.open(ModalLeaveComponent, {});

//             return dialogRef.afterClosed();
//         } else {
//             return (true);
//         }
//     }

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
                // if (this.actualDistribution.get('validated')) {
                //     this.getDistributionBeneficiaries('transaction');
                // }
                this.loadingDistribution = false;
                this.loadingDatas = false;
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
                }
            });
    }

//     /**
//      * Gets the Beneficiaries of the actual distribution to display the table
//      */
//     getDistributionBeneficiaries(type: string) {
//         if (type === 'initial') {
//             this.loadingFirstStep = true;
//         } else if (type === 'final') {
//             this.loadingFinalStep = true;
//         } else if (type === 'both') {
//             this.loadingFirstStep = true;
//             this.loadingFinalStep = true;
//         } else if (type === 'transaction') {
//             this.loadingTransaction = true;
//         }
//         this.distributionService.getBeneficiaries(this.actualDistribution.get('id'))
//             .subscribe(distributionBeneficiaries => {

//                 const beneficiaries = this.setDistributionBenefAndGetBenef(distributionBeneficiaries);

//                 if (type === 'initial') {
//                     // Step 1 table
//                     this.initialBeneficiaryData = new MatTableDataSource(beneficiaries);
//                     this.loadingFirstStep = false;
//                 } else if (type === 'final') {
//                     // Step 4 table
//                     this.finalBeneficiaryData = new MatTableDataSource(beneficiaries);
//                     this.loadingFinalStep = false;
//                 } else if (type === 'both') {
//                     this.initialBeneficiaryData = new MatTableDataSource(beneficiaries);
//                     this.finalBeneficiaryData = new MatTableDataSource(beneficiaries);
//                     this.loadingFirstStep = false;
//                     this.loadingFinalStep = false;
//                 } else if (type === 'transaction') {
//                     this.formatTransactionTable();
//                 }

//                 if (!this.actualDistribution.get('validated')) {
//                     this.generateRandom();
//                 }

//                 if (this.loadingDatas === true) {
//                     this.loadingDatas = false;
//                 }
//             });

//         if (type === 'edit') {
//             this.finalBeneficiaryData = this.initialBeneficiaryData;
//         }
//     }

//     setDistributionBenefAndGetBenef(distributionBeneficiaries: any): Beneficiary[] {
//         this.actualDistribution.set(
//             'distributionBeneficiaries',
//             distributionBeneficiaries
//                 .map((distributionBeneficiariy: any) => DistributionBeneficiary.apiToModel(distributionBeneficiariy)));
//         return this.actualDistribution.get<DistributionBeneficiary[]>('distributionBeneficiaries').map(
//             (distributionBeneficiariy: any) => distributionBeneficiariy.get('beneficiary')
//         );
//     }

    /**
     * Store beneficiaries of the distribution in the cache
     */
    storeBeneficiaries(distribution: Distribution) {
        this.loaderCache = true;

        this.actualDistribution = distribution;

        const project = this.actualDistribution.get('project');
        const target = this.actualDistribution.get('type').get<string>('name');

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

//     checkPermission() {
//         this.cacheService.getUser().subscribe(
//             result => {
//                 this.actualUser = result;
//                 if (result && result.rights) {
//                     const rights = result.rights;
//                     if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER') {
//                         this.hasRights = true;
//                     }

//                     if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_COUNTRY_MANAGER') {
//                         this.hasRightsTransaction = true;
//                     }
//                 }
//             }
//         );
//     }


    finishDistribution() {
        this.distributionFinished = true;
    }


    /**
     * Get validated distribution type
     * @return string
     */
    getDistributionType() {

        if (this.actualDistribution.get('commodities')[0].get('modalityType').get('name') === 'Mobile Money') {
            return 'mobile-money';
        }
        // else if (distributionBeneficiary instanceof TransactionGeneral) {
        //     return 'general-relief';
        // } else if (distributionBeneficiary instanceof TransactionVoucher) {
        //     return 'qr-voucher';
        // }
    }
}
