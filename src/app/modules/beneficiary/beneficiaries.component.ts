import { Component, OnInit, HostListener, DoCheck, ViewChild } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { Households } from '../../model/households.new';
import { HouseholdsService } from '../../core/api/households.service';
import { GlobalText } from '../../../texts/global';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver/FileSaver';
import { ExportInterface } from '../../model/export.interface';
import { ProjectService } from '../../core/api/project.service';
import { FormControl } from '@angular/forms';
import { HouseholdsDataSource } from '../../model/households-data-source';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { LocationService } from 'src/app/core/api/location.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ModalService } from 'src/app/core/utils/modal.service';
import { TableServerComponent } from 'src/app/components/table/table-server/table-server.component';

@Component({
    selector: 'app-beneficiaries',
    templateUrl: './beneficiaries.component.html',
    styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements OnInit, DoCheck {

    public household = GlobalText.TEXTS;
    public nameComponent = 'beneficiaries';
    public loadingExport = false;

    public referedClassService;
    referedClassToken = Households;
    households: MatTableDataSource<Households>;
    selection = new SelectionModel<Households>(true, []);
    checkedElements: any = [];

    length: number;
    public extensionType: string;

    dataSource: HouseholdsDataSource;

    hasRights = false;
    hasRightsExport = false;

    // addButtons
    addToggled = false;

    updatable = false;
    deletable = false;

    @ViewChild(TableServerComponent) table: TableServerComponent;


    constructor(
        private cacheService: AsyncacheService,
        public householdsService: HouseholdsService,
        private router: Router,
        public snackbar: SnackbarService,
        public projectService: ProjectService,
        public dialog: MatDialog,
        public locationService: LocationService,
        public modalService: ModalService,
    ) { }

    // For windows size
    public maxHeight = 700;
    public maxWidthMobile = 750;
    public maxWidthFirstRow = 1000;
    public maxWidthSecondRow = 800;
    public maxWidth = 750;
    public heightScreen;
    public widthScreen;
    public language = GlobalText.language;

    // Add Beneficiaries To Project Dialog variables.
    projectForm = new FormControl();
    projectsList = new Array();
    selectedProject;

    ngOnInit() {
        this.checkSize();
        this.extensionType = 'xls';
        this.dataSource = new HouseholdsDataSource(this.householdsService);
        // this.dataSource.vulnerabilities.next(['disabled', 'solo parent', 'lactating', 'pregnant', 'nutritional issues']);
        this.getProjects('updateSelection');
        this.checkPermission();
    }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.household !== GlobalText.TEXTS) {
            this.household = GlobalText.TEXTS;
        }

        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    /**
     * Listener and function use in case where windows is resize
     * @param event
     */
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    toggleAddButtons() {
        this.addToggled = !this.addToggled;
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    addOneHousehold() {
        this.router.navigate(['/beneficiaries/add-beneficiaries']);
    }

    // updateBeneficiary(event) {
    //     this.router.navigate(['/beneficiaries/update-beneficiary', event]);
    // }

    setType(choice: string) {
        this.extensionType = choice;
    }

    /**
     * Export houshold data
     * @return file
     */
    export() {
        this.loadingExport = true;
        this.householdsService.export(this.extensionType).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    addToProject(template) {
        this.getProjects();
        this.dialog.open(template);
    }

    getProjects(target?) {
        if (!this.projectsList || this.projectsList.length === 0) {
            this.projectService.get().subscribe(
                success => {
                    this.projectsList = [];
                    if (success) {
                        success.forEach(
                            element => {
                                this.projectsList.push(element);
                            }
                        );
                    }
                    if (target && target === 'updateSelection') {
                        const tmpProjects: any = [];
                        this.projectsList.forEach(project => {
                            tmpProjects.push(project.name);
                        });

                        // this.dataSource.projects.next(tmpProjects);
                    }
                },
                error => {
                    this.projectsList = new Array();
                }
            );
        }
    }

    confirmAdding() {
        if (this.projectsList && this.dataSource) {
            const benefForApi = this.checkedElements.map((household: Households) => {
                return {id: household.get('id')};
            });
            this.projectService.addBeneficiaries(this.selectedProject, benefForApi).subscribe(
                success => {
                    this.snackbar.success(this.household.beneficiaries_added);
                    this.table.loadDataPage();
                }
            );
        }
        this.dialog.closeAll();
    }

    checkPermission() {
        this.cacheService.get('user').subscribe(
            result => {
                if (result && result.rights) {
                    const rights = result.rights;
                    if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_PROJECT_OFFICER') {
                        this.hasRights = true;
                        this.updatable = true;
                    }

                    if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER') {
                        this.deletable = true;
                    }

                    if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_COUNTRY_MANAGER') {
                        this.hasRightsExport = true;
                    }
                }
            }
        );
    }


    getChecked(event)  {
        this.checkedElements = event;
    }

    openDialog(event): void {

        this.modalService.openDialog(Households, this.householdsService, event);
        this.modalService.isCompleted.subscribe(() => {
            this.table.loadDataPage();
        });
    }
}
