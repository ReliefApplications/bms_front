import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSnackBar } from '@angular/material';

import { GlobalText } from '../../../texts/global';

import { Project } from '../../model/project';

import { ProjectService } from '../../core/api/project.service';
import { CacheService } from '../../core/storage/cache.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DistributionData } from '../../model/distribution-data';
import { Mapper } from '../../core/utils/mapper.service';
import { Router } from '@angular/router';

import { ExportInterface } from '../../model/export.interface';
import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { delay, finalize } from 'rxjs/operators';


@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
    public nameComponent = 'project_title';
    public distribution = GlobalText.TEXTS;

    projects: Project[];
    distributionData: MatTableDataSource<any>;
    distributionClass = DistributionData;
    projectClass = Project;

    // loading
    loadingDistributions = true;
    loadingCreation: boolean;
    loadingProjects = true;
    noNetworkData = false;

    selectedTitle = '';
    selectedProject = null;
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
        private _cacheService: CacheService,
        public snackBar: MatSnackBar,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
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
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.distribution !== GlobalText.TEXTS) {
            this.distribution = GlobalText.TEXTS;
            this.nameComponent = GlobalText.TEXTS.distribution_title;
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
                    this._cacheService.set((<typeof CacheService>this._cacheService.constructor)[this.projectClass.__classname__.toUpperCase() + 'S'], this.projects);
                    this.selectTitle(this.projects[0].name, this.projects[0]);
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
            ).toPromise().then(
                response => {
                    if (response || response === []) {
                        this.noNetworkData = false;
                        const distribution = DistributionData.formatArray(response);
                        this._cacheService.set((<typeof CacheService>this._cacheService.constructor)[DistributionData.__classname__.toUpperCase() + 'S'], distribution);

                        this.distributionData = new MatTableDataSource(distribution);
                    } else {
                        this.distributionData = null;
                        this.noNetworkData = true;
                    }
                }
            )
            .catch(
                error => {
                    this.distributionData = null;
                    this.noNetworkData = true;
                }
            )
    }

    addDistribution() {
        this.router.navigate(['projects/add-distribution'], { queryParams: { project: this.selectedProject.id } });
    }

    /**
     * Export distribution data
     */
    export() {
        this.distributionService.export('project', this.extensionType, this.selectedProject.id);
    }

    openNewProjectDialog() {
        this.loadingCreation = true;
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
                this.projectService.create(data['id'], data).subscribe(
                    response => {
                        this.getProjects();
                    },
                );
            }
        );
        dialogRef.afterClosed().subscribe(
            () => {
                this.loadingCreation = false;
            }
        );
    }

    checkPermission() {
        const voters = this._cacheService.get('user').voters;

        if (voters == "ROLE_ADMIN" || voters == 'ROLE_PROJECT_MANAGER')
            this.hasRights = true;

        if (voters == "ROLE_ADMIN" || voters == 'ROLE_PROJECT_MANAGER' || voters == "ROLE_PROJECT_OFFICER")
            this.hasRightsEdit = true;
    }
}
