import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Distribution } from 'src/app/model/distribution';


@Component({
    selector: 'app-distributions',
    templateUrl: './distributions.component.html',
    styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {
    public nameComponent = 'distributions';
    // distributionId: number;
    actualDistribution: Distribution;
    distributionFinished = false;
    loadingDatas = true;
    loadingDistribution = true;

    // Screen display variables.
    loaderCache = false;
    hideSnack = false;
    distributionIsStored = false;

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
        this.distributionFinished = true;
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
