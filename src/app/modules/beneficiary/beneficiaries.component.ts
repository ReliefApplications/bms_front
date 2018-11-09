import { Component, OnInit, HostListener } from '@angular/core';
import { MatTableDataSource, MatSnackBar, MatDialog } from '@angular/material';
import { CacheService } from '../../core/storage/cache.service';
import { Households } from '../../model/households';
import { HouseholdsService } from '../../core/api/households.service';
import { GlobalText } from '../../../texts/global';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver/FileSaver';
import { ExportInterface } from '../../model/export.interface';
import { ProjectService } from '../../core/api/project.service';
import { FormControl } from '@angular/forms';
import { HouseholdsDataSource } from '../../model/households-data-source';
import { LocationService } from 'src/app/core/api/location.service';

@Component({
    selector: 'app-beneficiaries',
    templateUrl: './beneficiaries.component.html',
    styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements OnInit {

    public household = GlobalText.TEXTS;
    public nameComponent = 'beneficiaries_title';

    public referedClassService;
    referedClassToken = Households;
    households: MatTableDataSource<Households>;
    length: number;
    public extensionType: string;

    dataSource: HouseholdsDataSource;

    hasRights: boolean = false;
    hasRightsDelete: boolean = false;
    hasRightsExport: boolean = false;

    //addButtons
    addToggled = false;

    constructor(
        private cacheService: CacheService,
        public householdsService: HouseholdsService,
        private router: Router,
        public snackBar: MatSnackBar,
        public projectService: ProjectService,
        public dialog: MatDialog,
        public locationService: LocationService,
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
        this.dataSource.loadHouseholds();
        this.dataSource.vulnerabilities.next(['disabled', 'solo parent', 'lactating', 'pregnant', 'nutritional issues']);
        this.getProjects('updateSelection');
        this.checkPermission();
        this.loadProvince();
    }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.household !== GlobalText.TEXTS) {
            this.household = GlobalText.TEXTS;
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
        this.householdsService.export(this.extensionType);
    }

    addToProject(template) {
        this.getProjects();
        this.dialog.open(template);
    }

    getProjects(target?) {
        if (!this.projectsList || this.projectsList.length === 0) {
            this.projectService.get().subscribe(
                success => {
                    success.forEach(
                        element => {
                            this.projectsList.push(element);
                        }
                    );

                    if (target && target == 'updateSelection') {
                        let tmpProjects: any = [];
                        this.projectsList.forEach(project => {
                            tmpProjects.push(project.name)
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
            this.projectService.addBeneficiaries(this.selectedProject, this.dataSource.filter).subscribe(
                success => {
                    this.snackBar.open('Beneficiairies added to the selected project', '', { duration: 3000, horizontalPosition: 'center' });
                }
            );
        }
        this.dialog.closeAll();
    }

    checkPermission() {
        const voters = this.cacheService.get('user').voters;

        if (voters == "ROLE_ADMIN" || voters == "ROLE_PROJECT_MANAGER" || voters == "ROLE_PROJECT_OFFICER")
            this.hasRights = true;

        if (voters == "ROLE_ADMIN" || voters == "ROLE_PROJECT_MANAGER")
            this.hasRightsDelete = true;

        if (voters == "ROLE_ADMIN" || voters == "ROLE_PROJECT_MANAGER" || voters == "ROLE_COUNTRY_MANAGER")
            this.hasRightsExport = true;
    }

    /**
     * Check which adm is selected to load the list of adm link to it
     * fro example : if adm1 (province) selected load adm2
     * @param index
     */
    selected(index) {
        let newObject = index.object;
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
            this.cacheService.set(CacheService.ADM1, this.dataSource.adm1.value);
        });
    }

    /**
     *  Get adm2 from the back or from the cache service with the key ADM2
     * @param adm1
     */
    loadDistrict(adm1) {
        this.locationService.getAdm2(adm1).subscribe(response => {
            this.dataSource.adm2.next(response);
            this.cacheService.set(CacheService.ADM2, this.dataSource.adm2.value);

        });
    }

    /**
     * Get adm3 from the back or from the cahce service with the key ADM3
     * @param adm2
     */
    loadCommunity(adm2) {
        this.locationService.getAdm3(adm2).subscribe(response => {
            this.dataSource.adm3.next(response);
            this.cacheService.set(CacheService.ADM3, this.dataSource.adm3.value);

        });
    }

    /**
     *  Get adm4 from the back or from the cahce service with the key ADM4
     * @param adm3
     */
    loadVillage(adm3) {
        this.locationService.getAdm4(adm3).subscribe(response => {
            this.dataSource.adm4.next(response);
            this.cacheService.set(CacheService.ADM4, this.dataSource.adm4.value);

        });
    }
}
