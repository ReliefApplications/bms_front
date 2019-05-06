import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NetworkService } from 'src/app/core/api/network.service';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ImportService } from 'src/app/core/utils/beneficiaries-import.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { DistributionService } from '../../core/api/distribution.service';
import { ProjectService } from '../../core/api/project.service';
import { Distribution } from '../../model/distribution.new';
import { Project } from '../../model/project.new';
import { LanguageService } from './../../../texts/language.service';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
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

    public maxHeight = 600;
    public maxWidth = 750;
    // public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    // public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    // public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

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
        ) { }

    ngOnInit() {
        if (this.importService.project) {
            this.selectProject(this.importService.project);
            this.importService.project = null;
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
