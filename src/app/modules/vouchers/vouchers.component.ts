import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { BookletService } from 'src/app/core/api/booklet.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { Booklet } from 'src/app/model/booklet';
import { Project } from 'src/app/model/project';
import { Voucher } from 'src/app/model/voucher';
import { DisplayType } from 'src/constants/screen-sizes';
import { ExportService } from '../../core/api/export.service';
@Component({
    selector: 'app-vouchers',
    templateUrl: './vouchers.component.html',
    styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit, OnDestroy {

    public nameComponent = 'vouchers';

    public loadingAssign = false;
    public loadingBooklet = true;
    public loadingExport = false;
    public loadingExportCodes = false;
    public load = false;

    public bookletClass = Booklet;
    public booklets: Booklet[];
    public bookletData: MatTableDataSource<Booklet>;
    public extensionType: string;
    public extensionTypeCode: string;
    public projectClass = Project;

    public projects = [];

    public selection = new SelectionModel<Voucher>(true, []);
    public checkedElements: Booklet[] = [];

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;


    @ViewChild(TableComponent) tableVoucher: TableComponent;

    constructor(
        public bookletService: BookletService,
        public dialog: MatDialog,
        public projectService: ProjectService,
        public _exportService: ExportService,
        public snackbar: SnackbarService,
        private modalService: ModalService,
        protected languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
    ) { }



    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
        this.extensionType = 'xls';
        this.extensionTypeCode = 'xls';
        this.getBooklets();
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
    }

    setType(choice: string) {
        this.extensionType = choice;
    }

    setTypeCode(choice: string) {
        this.extensionTypeCode = choice;
    }

    getBooklets() {
        this.bookletService.get().pipe(
            finalize(
                () => {
                    this.loadingBooklet = false;
                    this.load = false;
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
        this.modalService.isLoading.subscribe(() => {
            this.load = true;
        });
        this.modalService.isCompleted.subscribe(() => {
            this.getBooklets();
        });
    }

    openAssignDialog() {
        this.loadingAssign = true;
        this.projectService.get()
            .subscribe(
                response => {
                    this.loadingAssign = false;
                    if (response && response.length > 0) {
                        this.projects = response.reverse().map((project: any) => Project.apiToModel(project));
                        // this.projects = this.projectClass.formatArray(response).reverse();
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
                        this.getBooklets();
                        // this.tableVoucher.checkData();
                    });
                }
            );
    }

    print(event: Booklet) {
        this.snackbar.info(this.language.voucher_print_starting);

        return this._exportService.printVoucher(event.get('id'));
    }

    getChecked(event) {
        this.checkedElements = event;
    }


    printMany() {
        const bookletIds = [];
        const error = false;
        this.checkedElements.forEach((booklet: Booklet) => {
            bookletIds.push(booklet.get('id'));
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

    exportCodes() {
        this.loadingExportCodes = true;
        this._exportService.export('bookletCodes', true, this.extensionTypeCode).then(
            () => { this.loadingExportCodes = false; }
        ).catch(
            () => { this.loadingExportCodes = false; }
        );
    }
}
