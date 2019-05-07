import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NetworkService } from 'src/app/core/api/network.service';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { ImportService } from 'src/app/core/utils/beneficiaries-import.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { DisplayType } from 'src/constants/screen-sizes';
import { DistributionService } from '../../core/api/distribution.service';
import { ProjectService } from '../../core/api/project.service';
import { Distribution } from '../../model/distribution';
import { Project } from '../../model/project';


@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {
    public nameComponent = 'projects';

    loadingExport = false;

    projects: Project[];
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

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public projectService: ProjectService,
        public distributionService: DistributionService,
        private router: Router,
        public snackbar: SnackbarService,
        public dialog: MatDialog,
        public importService: ImportService,
        public networkService: NetworkService,
        public modalService: ModalService,
        public userService: UserService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
        ) { }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
        if (this.importService.project) {
            this.selectProject(this.importService.project);
            this.importService.project = null;
        }
        this.getProjects();
        this.extensionType = 'xls';
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
    }

    /**
     * update current project and its distributions when a other project box is clicked
     * @param project
     */
    selectProject(project: Project): void {


        // Cancel the previous project request
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
                        return Project.apiToModel(projectFromApi);
                    }).reverse();
                    // Auto select latest project if no project is selected
                    if (
                        !this.selectedProject ||
                        this.projects.filter((project: Project) => this.selectedProject.get('id') === project.get('id')).length === 0
                    ) {
                        this.selectProject(this.projects[0]);
                    }
                }
                else {
                    this.loadingDistributions = false;
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

        this.modalService.openDialog(Project, this.projectService, {action: 'add'});
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
