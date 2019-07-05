import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TableComponent } from 'src/app/components/table/table.component';
import { BookletService } from 'src/app/core/api/booklet.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { Booklet } from 'src/app/models/booklet';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { Project } from 'src/app/models/project';
import { ExportService } from '../../core/api/export.service';
@Component({
    selector: 'app-vouchers',
    templateUrl: './vouchers.component.html',
    styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit, OnDestroy {

    public nameComponent = 'vouchers';

    public loadingPrint = false;
    public loadingBooklet = true;
    public loadingExport = false;
    public loadingExportCodes = false;

    public bookletClass = Booklet;
    public booklets: Booklet[];
    public bookletData: MatTableDataSource<Booklet>;
    public extensionType: string;
    public extensionTypeCode: string;
    public projectClass = Project;

    public projects = [];

    public selection = new SelectionModel<Booklet>(true, []);

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
        public languageService: LanguageService,
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
        if (this.screenSizeSubscription) {
            this.screenSizeSubscription.unsubscribe();
        }
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
            this.loadingBooklet = true;
        });
        this.modalService.isCompleted.subscribe((response: boolean) => {
            if (response) {
                this.getBooklets();
            } else {
                this.loadingBooklet = false;
            }
        });
    }

    print(event: Booklet) {
        this.snackbar.info(this.language.voucher_print_starting);

        return this._exportService.printVoucher(event.get('id')).subscribe();
    }

    printMany() {
        this.loadingPrint = true;
        const error = false;
        const bookletIds = this.selection.selected.map((booklet: Booklet) => {
            return booklet.get<number>('id');
        });

        // TODO: switch to observables
        return !error ?
        this._exportService.printManyVouchers(bookletIds).subscribe((_: any) => {
            this.loadingPrint = false;
        }) : null;
    }

    export() {
        this.loadingExport = true;
        this._exportService.export('booklets', true, this.extensionType).subscribe(
            () => { this.loadingExport = false; },

            (_error: any) => { this.loadingExport = false; }
        );
      }

    exportCodes() {
        this.loadingExportCodes = true;
        this._exportService.export('bookletCodes', true, this.extensionTypeCode).subscribe(
            () => { this.loadingExportCodes = false; },
            (_error: any) => { this.loadingExportCodes = false; }
        );
    }
}
