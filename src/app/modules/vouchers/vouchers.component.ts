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
  public load: boolean = false;

  public bookletClass = Booklet;
  public booklets: Booklet[];
  public bookletData: MatTableDataSource<Booklet>;
  public extensionType: string;
  public projectClass = Project;
  public distributionClass = DistributionData;

  //Variables for the assigns' modal
  public controls = new FormControl('', [Validators.required]);
  public form = new FormGroup({
  });

  public storeChoice = {
    project: '',
    distribution: '',
    beneficiary: '',
  }

  public projects = [];
  public distributions = [];
  public beneficiaries = [];

  public step1: boolean = true;
  public step2: boolean = false;
  public step3: boolean = false;
  public step4: boolean = false;
  public step5: boolean = false;

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

  getBooklets() {
    // this.voucherService.get().pipe(
    //   finalize(
    //     () => {
    //       this.loadingVouchers = false;
    //     },
    //   )
    // ).subscribe(
    //   response => {
    //     if (response && response.length > 0) {
    //       this.vouchers = this.voucherClass.formatArray(response).reverse();
    //       this.voucherData = new MatTableDataSource(this.vouchers);
    //     } else if (response === null) {
    //       this.vouchers = null;
    //     }
    //   }
    // );

    const booklet = {
      code: 'code',
      number_vouchers: 10,
      individual_value: 50,
      currency: 'USD',
      status: 1,
      password: 'test33TEST',
      distribution_beneficiary: 1
    }
    this.booklets = [];
    this.booklets.push(new Booklet(booklet));
    this.bookletData = new MatTableDataSource(this.booklets);
    this.loadingBooklet = false;
  }

  /**
     * get all projects
     */
  getProjects(user_action): void {
    this.loadingAssign = true;

    this.projectService.get()
      .pipe(
        finalize(() => this.loadingAssign = false)
      )
      .subscribe(
        response => {
          if (response && response.length > 0) {
            this.projects = this.projectClass.formatArray(response).reverse();
          } else if (response === null) {
            this.projects = [];
          }

          this.openDialog(user_action);
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
      )
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

        dialogRef.afterClosed().subscribe(() => {
          if (createElement) {
            createElement.unsubscribe();
          }
        });
      }
      else {
        dialogRef = this.dialog.open(user_action);
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
}
