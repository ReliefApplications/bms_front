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
  public controls = new FormControl('', [Validators.required]);
  public form = new FormGroup({
    distributionControl: new FormControl({ value: '', required: true }),
    beneficiaryControl: new FormControl({ value: '', required: true }),
  });

  public storeChoice = {
    project: null,
    distribution: null,
    beneficiary: null,
  };

  public distributionName = '';
  public beneficiaryName = '';

  public projects = [];
  public distributions = [];
  public beneficiaries = [];

  public step1 = true;
  public step2 = false;
  public step3 = false;
  public step4 = false;
  public step5 = false;

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
    this.distributionService.getByProject(this.storeChoice.project)
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
    this.distributionService.getBeneficiaries(this.storeChoice.distribution)
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
        this.step1 = true;
        this.step2 = false;
        this.step3 = false;
        this.step4 = false;
        this.step5 = false;

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

  nextStep(step) {
    if (step === 2) {
      if (this.storeChoice.project === 0) {
        this.snackbar.error(this.voucher.voucher_select_project);
      } else if (this.storeChoice.distribution === 0) {
        this.snackbar.error(this.voucher.voucher_select_distribution);
      } else if (this.storeChoice.beneficiary === 0) {
        this.snackbar.error(this.voucher.voucher_select_beneficiary);
      } else {
        this.distributionName = this.distributions.filter(element => element.id === this.storeChoice.distribution)[0].name;
        this.beneficiaryName = this.beneficiaries.filter(element => element.id === this.storeChoice.beneficiary)[0].full_name;

        this.step1 = false;
        this.step2 = true;
      }
    }
    // Step 3 passed when we scan the QRCode
    else if (step === 4) {
      this.step3 = false;
      this.step4 = true;
    } else if (step === 5) {
      if (this.displayPassword && (isNaN(Number(this.password)) || this.password === '' || this.password.length !== 4)) {
        this.snackbar.error(this.voucher.voucher_only_digits);
      } else {
        this.loadingPassword = true;

        if (!this.displayPassword) {
          this.password = null;
        }
        // TODO remove this next line
        this.bookletQRCode = 'V3hA7#000-000-000';

        this.bookletService.setPassword(this.bookletQRCode, this.password)
          .pipe(
            finalize(
              () => this.loadingPassword = false
            )
          )
          .subscribe(
            () => {
              this.snackbar.success(this.voucher.voucher_password_changed);
              this.step4 = false;
              this.step5 = true;
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

    this.step2 = false;
    this.step3 = true;
  }

  assignBooklet() {
    this.loadingAssignation = true;
    const bookletId = this.bookletQRCode;

    this.bookletService.assignBenef(bookletId, this.storeChoice.beneficiary)
      .pipe(
        finalize(
          () => this.loadingAssignation = false
        )
      )
      .subscribe(
        () => {
          this.snackbar.success(
            this.voucher.voucher_assigned_success + this.beneficiaryName);
        },
        err => {
          this.snackbar.error(err.error);
        }
      );
  }

  createElement(createElement: Object) {
    createElement = this.bookletClass.formatForApi(createElement);
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

  export() {
    this._exportService.export('booklets', true, this.extensionType);
  }
}
