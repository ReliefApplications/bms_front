import { Component, Input, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Beneficiary } from 'src/app/models/beneficiary';
import { Distribution } from 'src/app/models/distribution';
import { Project } from 'src/app/models/project';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { BookletService } from 'src/app/core/api/booklet.service';
import { LanguageService } from 'src/app/core/language/language.service';

@Component({
    selector: 'app-modal-assign',
    templateUrl: './modal-assign.component.html',
    styleUrls: ['../modal.component.scss', './modal-assign.component.scss'],
})
export class ModalAssignComponent implements OnInit {
    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public snackbar: SnackbarService,
        public distributionService: DistributionService,
        public bookletService: BookletService,
        public dialog: MatDialog,
        public languageService: LanguageService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    public step = 1;

    public projectControl = new FormControl('', Validators.required);
    public distributionControl = new FormControl('', Validators.required);
    public beneficiaryControl = new FormControl('', Validators.required);
    public form = new FormGroup({
        projectControl: this.projectControl,
        distributionControl: this.distributionControl,
        beneficiaryControl: this.beneficiaryControl,
    });
    public voucherPasswordControl = new FormControl('', [Validators.required, Validators.pattern(/\d{4}/)]);
    public displayPasswordControl = new FormControl(false);
    public distributions: Distribution[] = [];
    public beneficiaries: Beneficiary[] = [];
    public projects: Project[] = [];
    public projectClass = Project;
    public distributionName = '';
    public beneficiaryName = '';
    public bookletQRCode;
    public password = '';
    public loadingPassword = false;
    public loadingAssignation = false;

    ngOnChanges() {
        console.log('yo', this.data)
    }

    ngOnInit() {
        if (this.data.project && this.data.distribution) {
            this.projectControl.setValue(this.data.project.get('id'));
            this.distributionControl.setValue(this.data.distribution.get('id'));
            this.distributionName = this.data.distribution.get('name');
            if (this.data.beneficiary) {
                this.beneficiaryControl.setValue(this.data.beneficiary.get('id'));
                this.beneficiaryName = this.data.beneficiary.get('localFullName');
            } else if (this.data.beneficiaries) {
                this.beneficiaries = this.data.beneficiaries;
            }
        } else if (this.data.projects) {
            this.projects = this.data.projects;
        }
    }

    /**
     * get all distributions of a project
     */
    getDistributions() {
        this.distributionService.getQrVoucherByProject(this.projectControl.value)
            .subscribe(
                response => {
                    if (response) {
                        // this.distributions = this.distributionClass.formatArray(response);
                        this.distributions = response.map((distribution: any) => Distribution.apiToModel(distribution));
                        this.distributionControl.setValue(null);
                        this.beneficiaryControl.setValue(null);
                    } else {
                        this.distributions = [];
                    }
                }
            );
    }

    /**
     * Gets the Beneficiaries of the selected distribution
     */
    getBeneficiaries() {
        this.distributionService.getAssignableBeneficiaries(this.distributionControl.value)
            .subscribe(
                response => {

                    if (response) {
                        // this.beneficiaries = this.beneficiariesClass.formatArray(response);
                        this.beneficiaries = response
                            .map((distributionBeneficiary: any) => Beneficiary.apiToModel(distributionBeneficiary.beneficiary));
                        this.beneficiaryControl.setValue(null);
                    } else {
                        this.beneficiaries = [];
                    }
                }
            );
    }

    nextStep() {
        if (this.step === 1) {
            if (this.projectControl.value === 0) {
                this.snackbar.error(this.language.voucher_select_project);
            } else if (this.distributionControl.value === 0) {
                this.snackbar.error(this.language.voucher_select_distribution);
            } else if (this.beneficiaryControl.value === 0) {
                this.snackbar.error(this.language.voucher_select_beneficiary);
            } else {
                if (!this.data.distribution || !this.data.project) {
                    this.distributionName = this.distributions.filter(
                        (distribution: Distribution) => distribution.get('id') === this.distributionControl.value)[0].get('name');
                } if (!this.data.beneficiary) {
                    this.beneficiaryName = this.beneficiaries.filter(
                        (beneficiary: Beneficiary) => beneficiary.get('id') === this.beneficiaryControl.value)[0].get('localFullName');
                }
                this.step = 2;
            }
        }
        // Step 3 passed when we scan the QRCode
        else if (this.step === 3) {
            this.step = 4;
        } else if (this.step === 4) {
            if (this.voucherPasswordControl.hasError('pattern')) {
                this.snackbar.error(this.language.voucher_only_digits);
            } else {
                this.loadingPassword = true;

                if (!this.displayPasswordControl.value) {
                    this.password = null;
                }

                this.step = 5;

            }
        }
    }

    assignBooklet() {
        this.loadingAssignation = true;
        const bookletId = this.bookletQRCode;

        const assignObservable = this.bookletService.assignBenef(bookletId, this.beneficiaryControl.value, this.distributionControl.value)
            .pipe(
                finalize(
                    () => this.loadingAssignation = false
                )
            );

        if (this.voucherPasswordControl.value) {
            const passwordObservable = this.bookletService.setPassword(this.bookletQRCode, this.voucherPasswordControl.value)
                .pipe(
                    finalize(
                        () => {
                            this.loadingPassword = false;
                        }
                    )
                );
            forkJoin(assignObservable, passwordObservable).subscribe((_: any) => {
                this.snackbar.success(
                    this.language.voucher_assigned_success + this.beneficiaryName);
                this.dialog.closeAll();
            }, err => {
                this.snackbar.error(err.error);
            });
        } else {
            assignObservable.subscribe((_: any) => {
                this.snackbar.success(
                    this.language.voucher_assigned_success + this.beneficiaryName);
                this.dialog.closeAll();
            }, err => {
                this.snackbar.error(err.error);
            });
        }
    }

    getResultScanner(event) {
        this.bookletQRCode = event;

        this.step = 3;
    }

    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
    }
}
