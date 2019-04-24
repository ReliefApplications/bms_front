import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { Distribution } from 'src/app/model/distribution.new';
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { MatTableDataSource, MatDialog, MatStepper } from '@angular/material';
import { DistributionBeneficiary } from 'src/app/model/distribution-beneficiary.new';
import { GlobalText } from 'src/texts/global';
import { FormControl } from '@angular/forms';
import { User } from 'src/app/model/user.new';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ActivatedRoute } from '@angular/router';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { NetworkService } from 'src/app/core/api/network.service';
import { Observable } from 'rxjs';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';
import { finalize } from 'rxjs/operators';
import { ModalService } from 'src/app/core/utils/modal.service';

@Component({
  selector: 'app-not-validated-distribution',
  templateUrl: './not-validated-distribution.component.html',
  styleUrls: ['./not-validated-distribution.component.scss', '../distributions.component.scss']
})
export class NotValidatedDistributionComponent implements OnInit {

  @Input() actualDistribution: Distribution;
  @Input() loaderCache: boolean;
  @Input() distributionIsStored: boolean;

  @Output() emitStore = new EventEmitter<Distribution>();
  loadingExport = false;

  loadingDatas = true;
  loadingDistribution = true;

  // Control variables.

  loadingFirstStep = false;
  loadingThirdStep = false;
  loadingFinalStep = false;
  sampleSize = 10;
  extensionTypeStep1 = 'xls';
  extensionTypeStep3 = 'xls';

  loadingAdd: boolean;

  // Entities passed to table components.
  beneficiaryEntity = Beneficiary;
  entity: any;
  checkedLines: any = [];
  distributed = false;

  // Datas.
  initialBeneficiaryData: MatTableDataSource<Beneficiary>;
  randomSampleData: MatTableDataSource<Beneficiary>;
  finalBeneficiaryData: MatTableDataSource<Beneficiary>;

  // Screen display variables.
  public maxHeight = GlobalText.maxHeight;
  public maxWidthMobile = GlobalText.maxWidthMobile;
  public heightScreen;
  public widthScreen;
  TEXT = GlobalText.TEXTS;
  public language = GlobalText.language;

  // AddBeneficiary Dialog variables.
  beneficiaryList = new Array<Beneficiary>();
  selectedBeneficiaries = new Array<Beneficiary>();
  selected = false;

  actualUser = new User();
  hasRights = false;
  loaderValidation = false;

  interval: any;
  correctCode = false;
  progression: number;
  hideSnack = false;

  constructor(
      public distributionService: DistributionService,
      public cacheService: AsyncacheService,
      // private formBuilder: FormBuilder,
      private beneficiariesService: BeneficiariesService,
      public snackbar: SnackbarService,
      private dialog: MatDialog,
      private networkService: NetworkService,
      protected modalService: ModalService,
      public userService: UserService,
  ) {
  }
  ngOnInit() {
    this.checkSize();
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

//     /**
//    * check if the langage has changed
//    */
//     ngDoCheck() {
//         if (this.language !== GlobalText.language) {
//             this.language = GlobalText.language;
//         }
//     }


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
            }
            this.generateRandom();

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
            .map((distributionBeneficiariy: any) =>
                DistributionBeneficiary.apiToModel(distributionBeneficiariy, this.actualDistribution.get('id'))));
    return this.actualDistribution.get<DistributionBeneficiary[]>('distributionBeneficiaries').map(
        (distributionBeneficiariy: any) => distributionBeneficiariy.get('beneficiary')
    );
}

/**
 * Store beneficiaries of the distribution in the cache
 */
storeBeneficiaries() {

  this.emitStore.emit(this.actualDistribution);
}

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
                    const data = response.map((beneficiary: any) => {
                        const newBeneficiary = Beneficiary.apiToModel(beneficiary);
                        newBeneficiary.set('distributionId', this.actualDistribution.get('id'));
                        return newBeneficiary;
                    });
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
        default:
            break;
    }
}

/**
	* open each modal dialog
	*/
    openModal(dialogDetails: any): void {
        // Can only be a modalDetails
        this.modalService.openDialog(Beneficiary, this.beneficiariesService, dialogDetails);
        this.modalService.isCompleted.subscribe(() => {
            this.getDistributionBeneficiaries('both');
        });
    }

}
