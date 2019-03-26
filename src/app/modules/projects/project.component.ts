import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DonorService } from 'src/app/core/api/donor.service';
import { SectorService } from 'src/app/core/api/sector.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { GlobalText } from '../../../texts/global';
import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';
import { DistributionService } from '../../core/api/distribution.service';
import { ProjectService } from '../../core/api/project.service';
import { ImportedDataService } from '../../core/utils/imported-data.service';
import { Mapper } from '../../core/utils/mapper.service';
import { DistributionData } from '../../model/distribution-data';
import { Project as NewProject } from '../../model/project.new';






@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
    public nameComponent = 'projects';
    public language = GlobalText.language;
    loadingExport = false;

    projects: NewProject[];
    distributionData: MatTableDataSource<any>;
    distributionClass = DistributionData;

    // loading
    loadingDistributions = true;
    loadingProjects = true;
    noNetworkData = false;

    selectedTitle = '';
    selectedProject = null;
    selectedProjectId = null;
    extensionType: string;
    hasRights = false;
    hasRightsEdit = false;

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

    constructor(
        public projectService: ProjectService,
        public distributionService: DistributionService,
        public mapperService: Mapper,
        private router: Router,
        private _cacheService: AsyncacheService,
        public snackbar: SnackbarService,
        public dialog: MatDialog,
        public importedDataService: ImportedDataService,
        private donorService: DonorService,
        private sectorService: SectorService,
    ) { }

    ngOnInit() {
        if (this.importedDataService.emittedProject) {
            this.selectedProjectId = parseInt(this.importedDataService.project, 10);
        }
        this.getProjects();
        this.checkSize();
        this.extensionType = 'xls';
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    /**
     * update current project and its distributions when a other project box is clicked
     * @param project
     */
    selectProject(project: NewProject): void {
        this.selectedProject = project;
        this.loadingDistributions = true;
        this.getDistributionsByProject(project.fields.id.value);
    }

    setType(choice: string) {
        this.extensionType = choice;
    }

    // TO DO : get from cache
    /**
     * get all projects
     */
    getProjects(): void {
        this.projectService.get().pipe(
            finalize(
                () => {
                    this.loadingProjects = false;
                },
            )
        ).subscribe(
            response => {
                if (response && response.length > 0) {
                    // Transform response into array of projects
                    this.projects = response.map((projectFromApi: object) => {
                        return NewProject.apiToModel(projectFromApi);
                    }).reverse();
                    // Check for empty projects array
                    if (!this.projects.length) {
                        return;
                    }
                    // Auto select latest project if no project is selected
                    if (!this.projects.includes(this.selectedProject)) {
                        this.selectedProject = this.projects[0];
                    }

                } else if (response === null) {
                    this.loadingProjects = false;
                }
            }
        );
    }

    /**
     * get all distributions of a project
     * @param projectId
     */
    getDistributionsByProject(projectId: number): void {
        this.distributionService.
            getByProject(projectId).pipe(
                finalize(
                    () => {
                        this.loadingDistributions = false;
                    },
                )
            ).subscribe(
                response => {
                    if (response || response === []) {
                        this.noNetworkData = false;
                        const distribution = DistributionData.formatArray(response);
                        this.loadingDistributions = false;

                        this.distributionData = new MatTableDataSource(distribution);
                    } else {
                        this.distributionData = null;
                        this.loadingDistributions = false;
                        this.noNetworkData = true;
                    }
                }
            );
    }

    addDistribution() {
        this.router.navigate(['projects/add-distribution'], { queryParams: { project: this.selectedProject.id } });
    }

    /**
     * Export distribution data
     */
    export() {
        this.loadingExport = true;
        this.distributionService.export('project', this.extensionType, this.selectedProject.id).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    openNewProjectDialog() {
        const newProjectInstance = new NewProject;
        this.projectService.fillWithOptions(newProjectInstance);

        const dialogRef = this.dialog.open(
            ModalAddComponent, {
                data: {
                    objectInstance: newProjectInstance,
                }
            }
        );
        dialogRef.afterClosed().subscribe((closeMethod: string) => {
            if (closeMethod === 'Submit') {
                this.projectService.create(newProjectInstance.modelToApi()).subscribe(() => {
                    this.snackbar.success('Project ' + GlobalText.TEXTS.settings_created);
                    this.getProjects();
                });
            }
        });
    }
}
