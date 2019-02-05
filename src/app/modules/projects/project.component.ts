import { Component, OnInit, HostListener, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSnackBar } from '@angular/material';

import { GlobalText } from '../../../texts/global';

import { Project } from '../../model/project';

import { ProjectService } from '../../core/api/project.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DistributionData } from '../../model/distribution-data';
import { Mapper } from '../../core/utils/mapper.service';
import { Router } from '@angular/router';

import { ExportInterface } from '../../model/export.interface';
import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { delay, finalize } from 'rxjs/operators';
import { ImportedDataService} from '../../core/utils/imported-data.service'


@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
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
    hasRights: boolean = false;
    hasRightsEdit: boolean = false;

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
        public importedDataService: ImportedDataService
    ) { }

    ngOnInit() {
        if (this.importedDataService.emittedProject) {
            this.selectedProjectId = parseInt(this.importedDataService.project)
            this.getProjects()
        }
        else {
            this.getProjects();
        }
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
     * check if the langage has changed
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
                    this.projects = this.projectClass.formatArray(response).reverse();
                    if (this.selectedProjectId) {
                        this.autoProjectSelect(this.selectedProjectId)
                    } else {
                        this.selectTitle(this.projects[0].name, this.projects[0]);
                    }
                    this.loadingProjects = false;
                } else if (response === null) {
                    this.projects = null;
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
            )
        // .catch(
        //     error => {
        //         this.distributionData = null;
        //         this.noNetworkData = true;
        //     }
        // )
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
            () => { this.loadingExport = false }
        ).catch(
            () => { this.loadingExport = false }
        )
    }

    openNewProjectDialog() {
        const dialogRef = this.dialog.open(
            ModalAddComponent, {
                data: {
                    data: [],
                    entity: Project,
                    service: this.projectService,
                    mapper: this.mapperService
                }
            }
        );
        const create = dialogRef.componentInstance.onCreate.subscribe(
            (data) => {
                let exists: boolean = false;
                if (this.projects) {
                  this.projects.forEach(element => {
                    if (element.name.toLowerCase() == data.name.toLowerCase()) {
                      this.snackBar.open(this.distribution.settings_project_exists, '', { duration: 5000, horizontalPosition: 'right' });
                      exists = true;
                      return;
                    }
                  });
                }

                if (exists == false)
                    this.createElement(data);
            }
        );
    }

    createElement(createElement: Object) {
        createElement = Project.formatForApi(createElement);
        this.projectService.create(createElement['id'], createElement).subscribe(response => {
            this.snackBar.open("Project " + this.distribution.settings_created, '', { duration: 5000, horizontalPosition: 'right' });
            this.getProjects();
        });
    }

    checkPermission() {
        this._cacheService.getUser().subscribe(
            result => {
                const rights = result.rights;
                if (rights == "ROLE_ADMIN" || rights == 'ROLE_PROJECT_MANAGER')
                    this.hasRights = true;

                if (rights == "ROLE_ADMIN" || rights == 'ROLE_PROJECT_MANAGER' || rights == "ROLE_PROJECT_OFFICER")
                    this.hasRightsEdit = true;
            }
        )
    }

    autoProjectSelect(input: string) {
        let selector = parseInt(input)
        this.projects.forEach(e => {
            if (e.id == selector) {
                this.selectTitle(e.name, e);
            }
        })
    }
}
