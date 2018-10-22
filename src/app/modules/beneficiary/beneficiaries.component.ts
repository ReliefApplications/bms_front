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
    loadingBeneficiaries: boolean = true;
    public extensionType: string;

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

    // Beneficiaries
    public selection = new Array<number>();

    // Add Beneficiaries To Project Dialog variables.
    projectForm = new FormControl();
    projectsList = new Array();
    selectedProject;

    ngOnInit() {
        this.checkSize();
        this.checkHouseholds(0, 50);
        this.extensionType = 'xls';
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

    /**
     * Get list of all households and display it
     */
    checkHouseholds(pageIndex, pageSize): void {
        this.referedClassService = this.householdsService;
        this.referedClassService.get(pageIndex, pageSize).subscribe(response => {
            response[1] = this.referedClassToken.formatArray(response[1]);
            this.households = new MatTableDataSource(response[1]);
            this.length = response[0];
            this.cacheService.set(CacheService.HOUSEHOLDS, response[1]);
            this.loadingBeneficiaries = false;
        });
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
                success => {
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
        if (this.projectsList && this.selection) {
            this.projectService.addBeneficiaries(this.selectedProject, this.selection).subscribe(
                success => {
                    this.snackBar.open('Beneficiairies added to the selected project', '', { duration: 3000, horizontalPosition: 'center' });
                }
            );
        }
        this.dialog.closeAll();
    }

    updateSelection(data: any) {
        this.selection = data;
    }

    updateData(event) {
        this.checkHouseholds(event.pageIndex, event.pageSize);
    }
}
