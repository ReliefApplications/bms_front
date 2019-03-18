import { Component, OnInit, DoCheck, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { DistributionData } from 'src/app/model/distribution-data';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Project } from 'src/app/model/project';
import { Beneficiaries } from 'src/app/model/beneficiary';
import { GlobalText } from '../../../../texts/global';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-modal-assign',
    templateUrl: './modal-assign.component.html',
    styleUrls: ['../modal.component.scss', './modal-assign.component.scss'],
})
export class ModalAssignComponent extends ModalComponent implements OnInit, DoCheck {

    @Input() data: any;
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
    public distributions = [];
    public beneficiaries = [];
    public projects = [];
    public projectClass = Project;
    public distributionClass = DistributionData;
    public beneficiariesClass = Beneficiaries;
    public distributionName = '';
    public beneficiaryName = '';
    public bookletQRCode = 'VC7PZ#003-003-003';
    public password = '';
    public voucher = GlobalText.TEXTS;
    public loadingPassword = false;
    public displayPassword = false;
    public loadingAssignation = false;


    ngOnInit() {

        if (this.data.project && this.data.distribution && this.data.beneficiaries) {
            this.projectControl.setValue(this.data.project.id);
            this.distributionControl.setValue(this.data.distribution.id);
            this.distributionName = this.data.distribution.name;
            this.beneficiaries = this.data.beneficiaries;
        } else if (this.data.projects) {
            this.projects = this.data.projects;
        }
    }

    /**
     * get all distributions of a project
     */
    getDistributions() {
        this.distributionService.getByProject(this.projectControl.value)
            .subscribe(
                response => {
                    if (response || response === []) {
                        this.distributions = this.distributionClass.formatArray(response);
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
        this.distributionService.getBeneficiaries(this.distributionControl.value)
            .subscribe(
                response => {

                    if (response || response === []) {
                        this.beneficiaries = this.beneficiariesClass.formatArray(response);
                    } else {
                        this.beneficiaries = [];
                    }
                }
            );
    }

    nextStep() {
        if (this.step === 1) {
            if (this.projectControl.value === 0) {
                this.snackbar.error(this.voucher.voucher_select_project);
            } else if (this.distributionControl.value === 0) {
                this.snackbar.error(this.voucher.voucher_select_distribution);
            } else if (this.beneficiaryControl.value === 0) {
                this.snackbar.error(this.voucher.voucher_select_beneficiary);
            } else {
                if (!this.data.distribution || !this.data.project) {
                    this.distributionName = this.distributions.filter(element => element.id === this.distributionControl.value)[0].name;
                }
                this.beneficiaryName = this.beneficiaries.filter(element => element.id === this.beneficiaryControl.value)[0].full_name;
                this.step = 2;
            }
        }
        // Step 3 passed when we scan the QRCode
        else if (this.step === 3) {
            this.step = 4;
        } else if (this.step === 4) {
            if (this.voucherPasswordControl.hasError('pattern')) {
                this.snackbar.error(this.voucher.voucher_only_digits);
            } else {
                this.loadingPassword = true;

                if (!this.displayPassword) {
                    this.password = null;
                }

                this.step = 5;

            }
        }
    }

    assignBooklet() {
        this.loadingAssignation = true;
        const bookletId = this.bookletQRCode;



        const assignObservable = this.bookletService.assignBenef(bookletId, this.beneficiaryControl.value)
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
                forkJoin(assignObservable, passwordObservable).subscribe((res: any) => {
                    this.snackbar.success(
                    this.voucher.voucher_assigned_success + this.beneficiaryName);
                    this.dialog.closeAll();
                }, err => {
                    this.snackbar.error(err.error);
                });
            } else {
                assignObservable.subscribe((res: any) => {
                    this.snackbar.success(
                    this.voucher.voucher_assigned_success + this.beneficiaryName);
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
