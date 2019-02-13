import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../texts/global';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
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

  public loadingAssign: boolean = false;
  public loadingBooklet: boolean = true;
  public loadingExport: boolean = false;
  public loadingPassword: boolean = false;
  public loadingAssignation: boolean = false;
  public load: boolean = false;

  public bookletClass = Booklet;
  public booklets: Booklet[];
  public bookletData: MatTableDataSource<Booklet>;
  public extensionType: string;
  public projectClass = Project;
  public distributionClass = DistributionData;
  public beneficiariesClass = Beneficiaries;

  //Variables for the assigns' modal
  public controls = new FormControl('', [Validators.required]);
  public form = new FormGroup({
    distributionControl: new FormControl({ value: '', required: true }),
    beneficiaryControl: new FormControl({ value: '', required: true }),
  });

  public storeChoice = {
    project: 0,
    distribution: 0,
    beneficiary: 0,
  }

  public distributionName: string = '';
  public beneficiaryName: string = '';

  public projects = [];
  public distributions = [];
  public beneficiaries = [];

  public step1: boolean = true;
  public step2: boolean = false;
  public step3: boolean = false;
  public step4: boolean = false;
  public step5: boolean = false;

  public bookletQRCode: string = "VC7PZ#003-003-003";
  public code: string = '';
  public displayPassword: boolean = false;

  constructor(
    public bookletService: BookletService,
    public dialog: MatDialog,
    public mapperService: Mapper,
    public projectService: ProjectService,
    public distributionService: DistributionService,
    public snackBar: MatSnackBar
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
    if (this.dialog.openDialogs.length == 0) {
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

      }
      else {
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
    this.snackBar.open(message, '', { duration: 5000, horizontalPosition: 'center' });
    this.dialog.closeAll();
  }

  nextStep(step) {
    if (step == 2) {
      if (this.storeChoice.project == 0) {
        this.snackBar.open(this.voucher.voucher_select_project, '', { duration: 5000, horizontalPosition: 'center' });
      }
      else if (this.storeChoice.distribution == 0) {
        this.snackBar.open(this.voucher.voucher_select_distribution, '', { duration: 5000, horizontalPosition: 'center' });
      }
      else if (this.storeChoice.beneficiary == 0) {
        this.snackBar.open(this.voucher.voucher_select_beneficiary, '', { duration: 5000, horizontalPosition: 'center' });
      }
      else {
        this.distributionName = this.distributions.filter(element => { return element.id === this.storeChoice.distribution })[0].name;
        this.beneficiaryName = this.beneficiaries.filter(element => { return element.id === this.storeChoice.beneficiary })[0].full_name;

        this.step1 = false;
        this.step2 = true;
      }
    }
    // Step 3 passed when we scan the QRCode
    else if (step == 4) {
      this.step3 = false;
      this.step4 = true;
    }
    else if (step == 5) {
      if (this.displayPassword && (isNaN(Number(this.code)) || this.code == '' || this.code.length != 4)) {
        this.snackBar.open(this.voucher.voucher_only_digits, '', { duration: 5000, horizontalPosition: 'center' });
      }
      else {
        this.loadingPassword = true;

        if (!this.displayPassword) {
          this.code = null;
        }
        // TODO remove this next line
        this.bookletQRCode = "VC7PZ#003-003-003";

        const body = {
          code: this.code,
        };

        this.bookletService.setPassword(this.bookletQRCode, body)
          .pipe(
            finalize(
              () => this.loadingPassword = false
            )
          )
          .subscribe(
            () => {
              this.snackBar.open(this.voucher.voucher_password_changed, '', { duration: 5000, horizontalPosition: 'center' });
              this.step4 = false;
              this.step5 = true;
            },
            err => {
              this.snackBar.open(err.error, '', { duration: 5000, horizontalPosition: "center" });
            }
          )
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
    const body = {
      booklet: this.bookletQRCode
    }

    this.bookletService.assignBenef(body, this.storeChoice.beneficiary)
      .pipe(
        finalize(
          () => this.loadingAssignation = false
        )
      )
      .subscribe(
        () => {
          this.snackBar.open(this.voucher.voucher_assigned_success + this.beneficiaryName, '', { duration: 5000, horizontalPosition: "center" });
          this.exit(this.voucher.voucher_confirm + ' ' + this.beneficiaryName);
        },
        err => {
          this.snackBar.open(err.error, '', { duration: 5000, horizontalPosition: "center" });
        }
      )
  }

  createElement(createElement: Object) {
    createElement = this.bookletClass.formatForApi(createElement);
    this.bookletService.create(createElement).subscribe(
      () => {
        this.getBooklets();
      });
  }
}
