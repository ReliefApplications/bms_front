import { Component, OnInit, HostListener, ViewChild, DoCheck } from '@angular/core';
import { GlobalText } from '../../../texts/global';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { Booklet } from 'src/app/model/booklet';
import { BookletService } from 'src/app/core/api/booklet.service';
import { ModalAddComponent } from 'src/app/components/modals/modal-add/modal-add.component';
import { Mapper } from 'src/app/core/utils/mapper.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { Project } from 'src/app/model/project';
import { SelectionModel } from '@angular/cdk/collections';
import { Voucher } from '../../model/voucher';
import { ExportService } from '../../core/api/export.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { TableVouchersComponent } from 'src/app/components/table/table-vouchers/table-vouchers.component';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';
@Component({
    selector: 'app-vouchers',
    templateUrl: './vouchers.component.html',
    styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit, DoCheck {

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
    public load = false;

    public bookletClass = Booklet;
    public booklets: Booklet[];
    public bookletData: MatTableDataSource<Booklet>;
    public extensionType: string;
    public projectClass = Project;

    public projects = [];

    public selection = new SelectionModel<Voucher>(true, []);
    public checkedElements: any = [];

    @ViewChild(TableVouchersComponent) tableVoucher: TableVouchersComponent;

    constructor(
        public bookletService: BookletService,
        public dialog: MatDialog,
        public mapperService: Mapper,
        public projectService: ProjectService,
        public _exportService: ExportService,
        public snackbar: SnackbarService
    ) { }



    ngOnInit() {
        this.checkSize();
        this.extensionType = 'xls';

        this.getBooklets();
    }

    ngDoCheck() {
        if (this.voucher !== GlobalText.TEXTS) {
            this.language = GlobalText.language;
            this.voucher = GlobalText.TEXTS;
        }
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

            }
        }
    }

    openAssignDialog() {
        this.loadingAssign = true;
        this.projectService.get()
            .subscribe(
                response => {
                    this.loadingAssign = false;
                    if (response && response.length > 0) {
                        this.projects = this.projectClass.formatArray(response).reverse();
                    } else if (response === null) {
                        this.projects = [];
                    }
                    const dialogRef = this.dialog.open(ModalAssignComponent, {
                        id: 'modal-vouchers',
                        data: {
                            projects: this.projects
                        }
                    });
                    dialogRef.afterClosed().subscribe((test) => {
                        this.tableVoucher.updateData();
                    });
                }
            );
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
                this.snackbar.success(this.voucher.voucher_created);
                this.getBooklets();
            });
    }

    getChecked(event) {
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
        this.loadingExport = true;
        this._exportService.export('booklets', true, this.extensionType).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
      }
}
