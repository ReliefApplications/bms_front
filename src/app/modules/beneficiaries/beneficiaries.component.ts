import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableServerComponent } from 'src/app/components/table/table-server/table-server.component';
import { LocationService } from 'src/app/core/api/location.service';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { Household } from 'src/app/models/household';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { HouseholdsService } from '../../core/api/households.service';
import { ProjectService } from '../../core/api/project.service';
import { HouseholdsDataSource } from '../../models/data-sources/households-data-source';


@Component({
    selector: 'app-beneficiaries',
    templateUrl: './beneficiaries.component.html',
    styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements OnInit, OnDestroy {

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

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

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
        private screenSizeService: ScreenSizeService,
    ) { }

    // Add Beneficiaries To Project Dialog variables.
    projectsList = new Array();
    projectAddControl = new FormControl('', [Validators.required]);

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
        this.extensionType = 'xls';
        this.dataSource = new HouseholdsDataSource(this.householdsService);
        // this.dataSource.vulnerabilities.next(['disabled', 'solo parent', 'lactating', 'pregnant', 'nutritional issues']);
        this.getProjects('updateSelection');
        this.canEdit    = this.userService.hasRights('ROLE_BENEFICIARY_MANAGEMENT');
        this.canDelete  = this.userService.hasRights('ROLE_BENEFICIARY_MANAGEMENT');
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
    }

    toggleAddButtons() {
        this.addToggled = !this.addToggled;
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
        this.householdsService.export(this.extensionType,
            {
                filter: this.table.filtersForAPI,
                sort: {
                    sort: (this.table.sort && this.table.sort.active) ? this.table.sort.active : null,
                    direction: (this.table.sort && this.table.sort.direction !== '') ? this.table.sort.direction : null
                },
                pageIndex: 0, // page index
                pageSize: 10 // page size
            }
            ).then(
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
            this.projectService.addBeneficiaries(this.projectAddControl.value, benefForApi).subscribe(
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
