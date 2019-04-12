import { Component, OnInit, HostListener, ViewChild, DoCheck } from '@angular/core';
import { GlobalText } from '../../../texts/global';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { Booklet } from 'src/app/model/booklet.new';
import { BookletService } from 'src/app/core/api/booklet.service';
import { ModalAddComponent } from 'src/app/components/modals/modal-add/modal-add.component';
import { Mapper } from 'src/app/core/utils/mapper.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { Project } from 'src/app/model/project';
import { SelectionModel } from '@angular/cdk/collections';
import { Voucher } from '../../model/voucher.new';
import { ExportService } from '../../core/api/export.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { TableVouchersComponent } from 'src/app/components/table/table-vouchers/table-vouchers.component';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';
import { ModalService } from 'src/app/core/utils/modal.service';
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
        public snackbar: SnackbarService,
        private modalService: ModalService,
    ) { }



    ngOnInit() {
        this.checkSize();
        this.extensionType = 'xls';

        this.getBooklets();
    }

    // ngDoCheck() {
    //     if (this.voucher !== GlobalText.TEXTS) {
    //         this.language = GlobalText.language;
    //         this.voucher = GlobalText.TEXTS;
    //     }
    // }


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
                    this.booklets = response.reverse().map((booklet: any) => Booklet.apiToModel(booklet));
                    this.bookletData = new MatTableDataSource(this.booklets);
                } else if (response === null) {
                    this.booklets = null;
                }
            }
        );
    }

    /**
	* open each modal dialog
	*/
    openDialog(dialogDetails: any): void {
        this.modalService.openDialog(this.bookletClass, this.bookletService, dialogDetails);
        this.modalService.isCompleted.subscribe(() => {
            this.getBooklets();
        });
    }

    // openAssignDialog() {
    //     this.loadingAssign = true;
    //     this.projectService.get()
    //         .subscribe(
    //             response => {
    //                 this.loadingAssign = false;
    //                 if (response && response.length > 0) {
    //                     this.projects = this.projectClass.formatArray(response).reverse();
    //                 } else if (response === null) {
    //                     this.projects = [];
    //                 }
    //                 const dialogRef = this.dialog.open(ModalAssignComponent, {
    //                     id: 'modal-vouchers',
    //                     data: {
    //                         projects: this.projects
    //                     }
    //                 });
    //                 dialogRef.afterClosed().subscribe((test) => {
    //                     this.tableVoucher.checkData();
    //                 });
    //             }
    //         );
    // }

    // /**
    //    * To cancel on a dialog
    //    */
    // exit(message: string) {
    //     this.snackbar.info(message);
    //     this.dialog.closeAll();
    // }

    // createElement(createElement: Object) {
    //     this.bookletService.create(createElement).subscribe(
    //         () => {
    //             this.snackbar.success(this.voucher.voucher_created);
    //             this.getBooklets();
    //         });
    // }

    // getChecked(event) {
    //     this.checkedElements = event;
    // }

    // printMany() {
    //     const bookletIds = [];
    //     const error = false;
    //     this.checkedElements.forEach(element => {
    //         bookletIds.push(element.id);
    //     });
    //     return !error ? this._exportService.printManyVouchers(bookletIds) : null;
    // }

    // export() {
    //     this.loadingExport = true;
    //     this._exportService.export('booklets', true, this.extensionType).then(
    //         () => { this.loadingExport = false; }
    //     ).catch(
    //         () => { this.loadingExport = false; }
    //     );
    //   }
}
