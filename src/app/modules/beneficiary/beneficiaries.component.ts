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

    //addButtons
    addToggled = false;

    constructor(
        private cacheService: CacheService,
        public householdsService: HouseholdsService,
        private router: Router,
        public snackBar: MatSnackBar,
        public projectService: ProjectService,
        public dialog: MatDialog,
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

    getProjects() {
        if (!this.projectsList || this.projectsList.length === 0) {
            this.projectService.get().subscribe(
                (success : any[]) => {
                    success.forEach(
                        element => {
                            this.projectsList.push(element);
                        }
                    );
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
}
