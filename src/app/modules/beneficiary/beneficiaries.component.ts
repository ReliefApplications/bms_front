import { SelectionModel } from '@angular/cdk/collections';
import { Component, DoCheck, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/core/api/location.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { GlobalText } from '../../../texts/global';
import { HouseholdsService } from '../../core/api/households.service';
import { ProjectService } from '../../core/api/project.service';
import { UserService } from '../../core/api/user.service';
import { Households } from '../../model/households';
import { HouseholdsDataSource } from '../../model/households-data-source';

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

    // addButtons
    addToggled = false;

    constructor(
        private cacheService: AsyncacheService,
        public householdsService: HouseholdsService,
        private router: Router,
        public snackbar: SnackbarService,
        public projectService: ProjectService,
        public dialog: MatDialog,
        public locationService: LocationService,
        public userService: UserService
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
        this.dataSource.vulnerabilities.next(['disabled', 'solo parent', 'lactating', 'pregnant', 'nutritional issues']);
        this.getProjects('updateSelection');
        this.loadProvince();
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

    updateBeneficiary(event) {
        this.router.navigate(['/beneficiaries/update-beneficiary', event]);
    }

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

                        this.dataSource.projects.next(tmpProjects);
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
            this.projectService.addBeneficiaries(this.selectedProject, this.checkedElements).subscribe(
                success => {
                    this.snackbar.success(this.household.beneficiaries_added);
                }
            );
        }
        this.dialog.closeAll();
    }

    /**
     * Check which adm is selected to load the list of adm link to it
     * fro example : if adm1 (province) selected load adm2
     * @param index
     */
    selected(index) {
        const newObject = index.object;
        index = index.index;

        if (index === 'adm1') {
            const body = {};
            body['adm1'] = newObject.adm1.id;
            this.loadDistrict(body);
        } else if (index === 'adm2') {
            const body = {};
            body['adm2'] = newObject.adm2.id;
            this.loadCommunity(body);
        } else if (index === 'adm3') {
            const body = {};
            body['adm3'] = newObject.adm3.id;
            this.loadVillage(body);
        }
    }

    /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        this.locationService.getAdm1().subscribe(response => {
            this.dataSource.adm1.next(response);
        });
    }

    /**
     *  Get adm2 from the back or from the cache service with the key ADM2
     * @param adm1
     */
    loadDistrict(adm1) {
        this.locationService.getAdm2(adm1).subscribe(response => {
            this.dataSource.adm2.next(response);
        });
    }

    /**
     * Get adm3 from the back or from the cahce service with the key ADM3
     * @param adm2
     */
    loadCommunity(adm2) {
        this.locationService.getAdm3(adm2).subscribe(response => {
            this.dataSource.adm3.next(response);
        });
    }

    /**
     *  Get adm4 from the back or from the cahce service with the key ADM4
     * @param adm3
     */
    loadVillage(adm3) {
        this.locationService.getAdm4(adm3).subscribe(response => {
            this.dataSource.adm4.next(response);
        });
    }

    getChecked(event)  {
        this.checkedElements = event;
    }
}
