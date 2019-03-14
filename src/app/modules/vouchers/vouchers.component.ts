import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../texts/global';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { Booklet } from 'src/app/model/booklet';
import { BookletService } from 'src/app/core/api/booklet.service';
import { ModalAddComponent } from 'src/app/components/modals/modal-add/modal-add.component';
import { Mapper } from 'src/app/core/utils/mapper.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/core/api/project.service';
import { Project } from 'src/app/model/project';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { DistributionData } from 'src/app/model/distribution-data';
import { Beneficiaries } from 'src/app/model/beneficiary';
import { SelectionModel } from '@angular/cdk/collections';
import { Voucher } from '../../model/voucher';
import { ExportService } from '../../core/api/export.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';

@Component({
    selector: 'app-vouchers',
    templateUrl: './vouchers.component.html',
    styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit {

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

    public nameComponent = 'vouchers';
    public voucher = GlobalText.TEXTS;
    public language = GlobalText.language;

    public loadingAssign = false;
    public loadingBooklet = true;
    public loadingExport = false;
    public loadingPassword = false;
    public loadingAssignation = false;
    public load = false;

    public bookletClass = Booklet;
    public booklets: Booklet[];
    public bookletData: MatTableDataSource<Booklet>;
    public extensionType: string;
    public projectClass = Project;
    public distributionClass = DistributionData;
    public beneficiariesClass = Beneficiaries;

    // Variables for the assigns' modal
    public projectControl = new FormControl('', Validators.required);
    public distributionControl = new FormControl('', Validators.required);
    public beneficiaryControl = new FormControl('', Validators.required);
    public form = new FormGroup({
        projectControl: this.projectControl,
        distributionControl: this.distributionControl,
        beneficiaryControl: this.beneficiaryControl,
    });

    public voucherPasswordControl = new FormControl('', [Validators.required, Validators.pattern(/\d{4}/)]);

    public distributionName = '';
    public beneficiaryName = '';

    public projects = [];
    public distributions = [];
    public beneficiaries = [];

    public step = 1;

    public bookletQRCode = 'VC7PZ#003-003-003';
    public password = '';
    public displayPassword = false;
    public selection = new SelectionModel<Voucher>(true, []);
    public checkedElements: any = [];

    constructor(
        public bookletService: BookletService,
        public dialog: MatDialog,
        public mapperService: Mapper,
        public projectService: ProjectService,
        public distributionService: DistributionService,
        public _exportService: ExportService,
        public snackbar: SnackbarService
    ) { }

    ngOnInit() {
        this.checkSize();
        this.extensionType = 'xls';

        this.getBooklets();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    setType(choice: string) {
        this.extensionType = choice;
    }

    getBooklets() {
        this.bookletService.get().pipe(
            finalize(
                () => {
                    this.loadingBooklet = false;
                },
            )
        ).subscribe(
            response => {
                if (response && response.length > 0) {
                    this.booklets = this.bookletClass.formatArray(response).reverse();
                    this.bookletData = new MatTableDataSource(this.booklets);
                } else if (response === null) {
                    this.booklets = null;
                }
            }
        );
    }

    /**
     * get all projects
     */
    getProjects(user_action): void {
        this.loadingAssign = true;

        this.projectService.get()
            .pipe(
                finalize(() => {
                    this.loadingAssign = false;
                    this.openDialog(user_action);
                })
            )
            .subscribe(
                response => {
                    if (response && response.length > 0) {
                        this.projects = this.projectClass.formatArray(response).reverse();
                    } else if (response === null) {
                        this.projects = [];
                    }
                }
            );
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

    openDialog(user_action): void {
        if (this.dialog.openDialogs.length === 0) {
            let dialogRef;

            if (typeof user_action === 'string') {
                if (user_action === 'create') {
                    dialogRef = this.dialog.open(ModalAddComponent, {
                        data: { entity: this.bookletClass, service: this.bookletService, mapper: this.mapperService }
                    });
                }

                let createElement = null;
                if (dialogRef.componentInstance.onCreate) {
                    createElement = dialogRef.componentInstance.onCreate.subscribe();
                }

                const create = dialogRef.componentInstance.onCreate.subscribe((data) => {
                    this.createElement(data);
                });

                dialogRef.afterClosed().subscribe((test) => {
                    create.unsubscribe();
                });

            } else {
                this.step = 1;

                dialogRef = this.dialog.open(user_action, {
                    id: 'modal-voucher',
                });
            }
        }
    }

    /**
       * To cancel on a dialog
       */
    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
    }

  createElement(createElement: Object) {
    this.bookletService.create(createElement).subscribe(
      () => {
        this.getBooklets();
      });
  }

  getChecked(event) {
    this.checkedElements = event;
  }

  printMany() {
    const bookletIds = [];
    const error = false;
    this.checkedElements.forEach(element => {
      bookletIds.push(element.id);
    });
    return !error ? this._exportService.printManyVouchers(bookletIds) : null;
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
                this.distributionName = this.distributions.filter(element => element.id === this.distributionControl.value)[0].name;
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
                // TODO remove this next line
                // this.bookletQRCode = 'V3hA7#000-000-000';

                this.bookletService.setPassword(this.bookletQRCode, this.voucherPasswordControl.value)
                    .pipe(
                        finalize(
                            () => this.loadingPassword = false
                        )
                    )
                    .subscribe(
                        () => {
                            this.snackbar.success(this.voucher.voucher_password_changed);
                            this.step = 5;
                        },
                        err => {
                            this.snackbar.error(err.error);
                        }
                    );
            }
        }
    }

    getResultScanner(event) {
        this.bookletQRCode = event;

        this.step = 3;
    }

    assignBooklet() {
        this.loadingAssignation = true;
        const bookletId = this.bookletQRCode;

        this.bookletService.assignBenef(bookletId, this.beneficiaryControl.value)
            .pipe(
                finalize(
                    () => this.loadingAssignation = false
                )
            )
            .subscribe(
                () => {
                    this.snackbar.success(
                        this.voucher.voucher_assigned_success + this.beneficiaryName);
                    this.dialog.closeAll();
                },
                err => {
                    this.snackbar.error(err.error.message);
                }
            );
    }

    export() {
        this._exportService.export('booklets', true, this.extensionType);
      }
}
