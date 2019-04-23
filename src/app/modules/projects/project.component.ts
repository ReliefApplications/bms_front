import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NetworkService } from 'src/app/core/api/network.service';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { GlobalText } from '../../../texts/global';
import { DistributionService } from '../../core/api/distribution.service';
import { ProjectService } from '../../core/api/project.service';
import { ImportedDataService } from '../../core/utils/imported-data.service';
import { Mapper } from '../../core/utils/mapper.service';
import { Distribution } from '../../model/distribution.new';
import { Project as NewProject } from '../../model/project.new';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
    public nameComponent = 'projects';
    public language = GlobalText.language;
    public texts = GlobalText.TEXTS;

    loadingExport = false;

    projects: NewProject[];
    distributionData: MatTableDataSource<Distribution>;
    distributionClass = Distribution;
    public httpSubscriber: Subscription;

    // loading
    loadingDistributions = true;
    loadingProjects = true;
    noNetworkData = false;

    selectedTitle = '';
    selectedProject = null;
    selectedProjectId = null;
    extensionType: string;

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
        public networkService: NetworkService,
        public modalService: ModalService,
        public userService: UserService,
    ) { }

    ngOnInit() {
        if (this.importedDataService.emittedProject) {
            this.selectedProjectId = parseInt(this.importedDataService.project, 10);
            this.getProjects();

        } else {
            this.getProjects();
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
        if (this.httpSubscriber) {
            this.httpSubscriber.unsubscribe();
        }
        this.selectedProject = project;
        this.loadingDistributions = true;
        this.getDistributionsByProject(project.get('id'));
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
                        this.selectProject(this.projects[0]);
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
        this.httpSubscriber = this.distributionService.
            getByProject(projectId).pipe(
                finalize(
                    () => {
                        this.loadingDistributions = false;
                    },
                )
            ).subscribe(
                response => {
                    this.distributionData = new MatTableDataSource();

                    const instances = [];
                    if (response || response === []) {
                        this.noNetworkData = false;
                        for (const item of response ) {
                            instances.push(Distribution.apiToModel(item));
                        }
                        this.distributionData = new MatTableDataSource(instances);
                        this.loadingDistributions = false;
                    } else {
                        this.loadingDistributions = false;
                        this.noNetworkData = true;
                    }
                }
            );
    }

    addDistribution() {
        this.router.navigate(['projects/add-distribution'], { queryParams: { project: this.selectedProject.get('id') } });
    }

    /**
     * Export distribution data
     */
    export() {
        this.loadingExport = true;
        this.distributionService.export('project', this.extensionType, this.selectedProject.get('id')).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    openNewProjectDialog() {

        this.modalService.openDialog(NewProject, this.projectService, {action: 'add'});
        this.modalService.isCompleted.subscribe(() => {
            this.getProjects();
        });
    }

    openDialog(dialogDetails: any): void {

        this.modalService.openDialog(Distribution, this.distributionService, dialogDetails);
        this.modalService.isCompleted.subscribe(() => {
            this.getDistributionsByProject(this.selectedProject.get('id'));
        });
    }
}
