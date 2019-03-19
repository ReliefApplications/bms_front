import { Component, DoCheck, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DonorService } from 'src/app/core/api/donor.service';
import { SectorService } from 'src/app/core/api/sector.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { GlobalText } from '../../../texts/global';
import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';
import { DistributionService } from '../../core/api/distribution.service';
import { ProjectService } from '../../core/api/project.service';
import { ImportedDataService } from '../../core/utils/imported-data.service';
import { Mapper } from '../../core/utils/mapper.service';
import { DistributionData } from '../../model/distribution-data';
import { Project } from '../../model/project';
import { Project as NewProject } from '../../model/project.new';






@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, DoCheck {
    public nameComponent = 'projects';
    public distribution = GlobalText.TEXTS;
    public language = GlobalText.language;
    loadingExport = false;

    projects: Project[];
    distributionData: MatTableDataSource<any>;
    distributionClass = DistributionData;
    projectClass = Project;

    // loading
    loadingDistributions = true;
    loadingProjects = true;
    noNetworkData = false;

    selectedTitle = '';
    selectedProject = null;
    selectedProjectId = null;
    isBoxClicked = false;
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
        public snackBar: MatSnackBar,
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
        this.checkPermission();
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
     * check if the language has changed
     */
    ngDoCheck() {
        if (this.distribution !== GlobalText.TEXTS) {
            this.distribution = GlobalText.TEXTS;
            this.nameComponent = GlobalText.TEXTS.distributions;
        }

        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }
    /**
     * update current project and its distributions when a other project box is clicked
     * @param title
     * @param project
     */
    selectTitle(title, project): void {
        this.isBoxClicked = true;
        this.selectedTitle = title;
        this.selectedProject = project;
        this.loadingDistributions = true;
        this.getDistributionsByProject(project.id);
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
                    const formattedResponse = this.projectClass.formatArray(response).reverse();
                    if (!this.projects || formattedResponse.length !== this.projects.length) {
                        this.projects = formattedResponse;
                        if (this.selectedProjectId) {
                            this.autoProjectSelect(this.selectedProjectId);
                        } else {
                            this.selectTitle(this.projects[0].name, this.projects[0]);
                        }
                        this.loadingProjects = false;
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
        this.fillWithOptions(newProjectInstance);
        const dialogRef = this.dialog.open(
            ModalAddComponent, {
                data: {
                    objectInstance: newProjectInstance,
                }
            }
        );
        dialogRef.afterClosed().subscribe((closeMethod: string) => {
            if (closeMethod) {
                this.projectService.create(newProjectInstance.modelToApi()).subscribe(() => {
                    this.snackBar.open('Project ' + this.distribution.settings_created,
                        '', { duration: 5000, horizontalPosition: 'right' });
                });
                this.getProjects();
            }
        });

        /*
        const create = dialogRef.componentInstance.objectCreated.subscribe(
            (data) => {
                let exists = false;
                if (this.projects) {
                    this.projects.forEach(element => {
                        if (element.name.toLowerCase() === data.name.toLowerCase()) {
                            this.snackBar.open(this.distribution.settings_project_exists,
                              '', { duration: 5000, horizontalPosition: 'right' });
                            exists = true;
                            return;
                        }
                    });
                }

                if (! exists) {
                    this.createElement(data);
                }
            }
        );
        */
    }
    fillWithOptions(projectInstance: NewProject) {
        this.donorService.getOptions(projectInstance, 'donors');
        this.sectorService.getOptions(projectInstance, 'sectors');
    }


    checkPermission() {
        this._cacheService.getUser().subscribe(
            result => {
                const rights = result.rights;
                if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER') {
                    this.hasRights = true;
                }

                if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_PROJECT_OFFICER') {
                    this.hasRightsEdit = true;
                }
            }
        );
    }

    autoProjectSelect(input: string) {
        const selector = parseInt(input, 10);
        this.projects.forEach(e => {
            if (e.id === selector) {
                this.selectTitle(e.name, e);
            }
        });
    }
}
