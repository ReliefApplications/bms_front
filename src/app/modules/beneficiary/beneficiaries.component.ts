import { SelectionModel } from '@angular/cdk/collections';
import { Component, HostListener, OnInit, ViewChild, ɵConsole } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { TableServerComponent } from 'src/app/components/table/table-server/table-server.component';
import { LocationService } from 'src/app/core/api/location.service';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { Household } from 'src/app/model/household';
import { HouseholdsService } from '../../core/api/households.service';
import { ProjectService } from '../../core/api/project.service';
import { HouseholdsDataSource } from '../../model/households-data-source';


@Component({
    selector: 'app-beneficiaries',
    templateUrl: './beneficiaries.component.html',
    styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements OnInit {

    public nameComponent = 'beneficiaries';
    public loadingExport = false;

    public referedClassService;
    referedClassToken = Household;
    households: MatTableDataSource<Household>;
    selection = new SelectionModel<Household>(true, []);
    checkedElements: any = [];

    length: number;
    public extensionType: string;

    dataSource: HouseholdsDataSource;

    // addButtons
    addToggled = false;


    @ViewChild(TableServerComponent) table: TableServerComponent;

    canEdit     = false;
    canDelete   = false;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private router: Router,
        public householdsService: HouseholdsService,
        public snackbar: SnackbarService,
        public projectService: ProjectService,
        public dialog: MatDialog,
        public locationService: LocationService,
        public modalService: ModalService,
        public userService: UserService,
        public languageService: LanguageService,
    ) { }

    // For windows size
    public maxHeight = 700;
    public maxWidthMobile = 750;
    public maxWidthFirstRow = 1000;
    public maxWidthSecondRow = 800;
    public maxWidth = 750;
    public heightScreen;
    public widthScreen;

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
        this.canEdit    = this.userService.hasRights('ROLE_BENEFICIARY_MANAGEMENT');
        this.canDelete  = this.userService.hasRights('ROLE_BENEFICIARY_MANAGEMENT');
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
            const benefForApi = this.checkedElements.map((household: Household) => {
                return {id: household.get('id')};
            });
            this.projectService.addBeneficiaries(this.selectedProject, benefForApi).subscribe(
                success => {
                    this.snackbar.success(this.language.beneficiaries_added);
                    this.table.loadDataPage();
                    this.selection = new SelectionModel<Household>(true, []);
                    this.checkedElements = [];
                }
            );
        }
        this.dialog.closeAll();
    }

    getChecked(event)  {
        this.checkedElements = event;
    }

    openDialog(event): void {

        this.modalService.openDialog(Household, this.householdsService, event);
        this.modalService.isCompleted.subscribe(() => {
            this.table.loadDataPage();
        });
    }
}
