import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ModalConfirmationComponent } from 'src/app/components/modals/modal-confirmation/modal-confirmation.component';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Distribution } from 'src/app/models/distribution';


@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {
    public nameComponent = 'distributions';
    // distributionId: number;
    actualDistribution: Distribution;
    loadingDatas = true;
    loadingDistribution = true;

    // Screen display variables.
    loaderCache = false;
    hideSnack = false;
    distributionIsStored = false;

    // Tracks if user has updated the distribution in the current view
    updated = false;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public distributionService: DistributionService,
        public cacheService: AsyncacheService,
        // private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private beneficiariesService: BeneficiariesService,
        public snackbar: SnackbarService,
        public languageService: LanguageService,
        public dialog: MatDialog,
        public userService: UserService,
    ) {
    }

    ngOnInit() {
        // this.checkSize();
        this.getSelectedDistribution();
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
                        this.cacheService.storeBeneficiaries(project, this.actualDistribution, allBeneficiaries)
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
                                        this.snackbar.success(this.language.cache_distribution_added);
                                    }
                                    this.hideSnack = false;
                                }
                            );
                    }
                }
            );

            this.distributionIsStored = true;
    }

    finishDistribution() {
        this.actualDistribution.set('finished', true);
    }


    /**
     * Get validated distribution type
     * @return string
     */
    getDistributionType() {

        if (this.actualDistribution.get('commodities')[0].get('modalityType').get('name') === 'Mobile Money') {
            return 'mobile-money';
        } else if (this.actualDistribution.get('commodities')[0].get('modalityType').get('name') === 'QR Code Voucher') {
            return 'qr-voucher';
        } else {
            return 'general-relief';
        }
    }
}
