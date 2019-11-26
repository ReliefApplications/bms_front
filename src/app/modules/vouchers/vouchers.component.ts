import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TableServerComponent } from 'src/app/components/table/table-server/table-server.component';
import { BookletService } from 'src/app/core/api/booklet.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { Booklet } from 'src/app/models/booklet';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { BookletsDataSource } from 'src/app/models/data-sources/booklets-data-source';
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
    public loadingExportCodes = false;
    public loadingInsertion = false;

    public modalSubscriptions: Array<Subscription> = [];

    public referedClassService;
    public dataSource: BookletsDataSource;
    referedClassToken = Booklet;
    booklets: MatTableDataSource<Booklet>;
    public selection = new SelectionModel<Booklet>(true, []);

    public bookletClass = Booklet;
    public extensionType: string;
    public extensionTypeCode: string;
    public projectClass = Project;
    public numberToExport: number = null;

    public projects = [];

    public insertionProgress = 0;

    // Screen size
    public currentDisplayType: DisplayType;
    subscriptions: Array<Subscription>;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    @ViewChild(TableServerComponent, { static: false }) table: TableServerComponent;

    constructor(
        public bookletService: BookletService,
        public dialog: MatDialog,
        public projectService: ProjectService,
        public _exportService: ExportService,
        public snackbar: SnackbarService,
        private modalService: ModalService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
        public userService: UserService,
    ) { }

    ngOnInit() {
        this.dataSource = new BookletsDataSource(this.bookletService);
        this.subscriptions = [
            this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
                this.currentDisplayType = displayType;
            }),
            this.dataSource.length$.subscribe((length) => {
                this.numberToExport = length;
            }),
        ];
        this.extensionType = 'xls';
        this.extensionTypeCode = 'xls';
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        this.modalSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    setType(choice: string) {
        this.extensionType = choice;
    }

    setTypeCode(choice: string) {
        this.extensionTypeCode = choice;
    }

    /**
	* open each modal dialog
	*/
    openDialog(dialogDetails: any): void {
        this.modalSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        this.modalService.openDialog(this.bookletClass, this.bookletService, dialogDetails);

        const dataSubscription = this.modalService.dataSubject.subscribe((response: any) => {
            this.loadingInsertion = true;
            this.checkInsertedBooklets(response['lastBooklet'], response['expectedNumber']);
        });
        this.modalSubscriptions = [dataSubscription];
    }

    checkInsertedBooklets(lastId: number, totalExpected: number) {
        let previousValue = 0;
        const dataInsertionObservable = interval(10000).pipe(
            switchMap(() => {
                return this.bookletService.getInsertedBooklets(lastId);
            })
        ).subscribe(
            (res: number) => {
                // tslint:disable-next-line
                console.log(res);
                if (res === previousValue) {
                    dataInsertionObservable.unsubscribe();
                    this.snackbar.error(this.language.snackbar_error_creating + this.language.booklets + ` (${res}/${totalExpected})`);
                    this.loadingInsertion = false;
                    this.insertionProgress = 0;
                    this.table.loadDataPage();
                } else if (res >= totalExpected) {
                    dataInsertionObservable.unsubscribe();
                    this.snackbar.success(this.language.booklets + ' ' + this.language.snackbar_created_successfully);
                    this.loadingInsertion = false;
                    this.insertionProgress = 0;
                    this.table.loadDataPage();
                } else {
                    previousValue = res;
                    this.insertionProgress = Math.trunc((res / totalExpected) * 100);
                }
            }
        );
    }

    print(event: Booklet) {
        this.snackbar.info(this.language.voucher_print_starting);

        return this._exportService.printVoucher(event.get('id'), event.get('code')).subscribe();
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

    getNumberToExport() {
        if (this.selection.selected.length > 0) {
            return this.selection.selected.length;
        }
        return this.numberToExport > 0 ? this.numberToExport : null;
    }

    exportCodes() {
        this.loadingExportCodes = true;
        let filters = null;
        let ids = [];
        if (this.selection.selected.length > 0) {
            ids = this.selection.selected.map((booklet: Booklet) => booklet.get('id'));
        } else {
            filters = {
                filter: this.table.filtersForAPI,
                sort: {
                    sort: (this.table.sort && this.table.sort.active) ? this.table.sort.active : null,
                    direction: (this.table.sort && this.table.sort.direction !== '') ? this.table.sort.direction : null
                },
                pageIndex: 0,
                pageSize: -1 // No limit
            };
        }
        this._exportService.export('bookletCodes', true, this.extensionTypeCode, {}, filters, ids).subscribe(
            () => { this.loadingExportCodes = false; },
            (_error: any) => { this.loadingExportCodes = false; }
        );
    }

}
