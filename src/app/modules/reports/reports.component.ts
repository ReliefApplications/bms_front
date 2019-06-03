import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { UserService } from 'src/app/core/api/user.service';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/core/utils/date.adapter';
import { Distribution } from 'src/app/model/distribution';
import { Project } from 'src/app/model/project';
import { GraphDTO } from './graph.dto';
import { Graph } from './graph.model';
import { IndicatorService } from './services/indicator.service';
@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss'],
    animations: [
        trigger('periodDisplay', [
            state('hidden', style({
                height: '0px',
                padding: '0px',
                opacity: '0',
            })),
            state('showing', style({
                height: 'auto',
                padding: '24px',
                opacity: '1',
            })),
            transition('hidden => showing', animate('0.5s')),
            transition('showing => hidden', animate('0.5s')),
        ])
    ],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ],
})
export class ReportsComponent implements OnInit, OnDestroy {


//
// ─── VARIABLES DECLARATIONS ─────────────────────────────────────────────────────
//

    public enabledReports: Array<object> = [];
    public selectedReport: any = undefined;
    public enabledFrequencies: Array<object> = [];
    public selectedFrequency: any = undefined;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    // Choose period
    public periodMode = false;
    public periodControl = new FormGroup({
        startDate:  new FormControl(undefined, [Validators.required]),
        endDate:    new FormControl(undefined, [Validators.required]),
    });

    // Filters
    projectsControl = new FormGroup({
        projectsSelect: new FormControl(undefined, [
            Validators.required,
            Validators.minLength(1),
        ]),
    });
    distributionsControl = new FormGroup({
        projectSelect: new FormControl(undefined, [Validators.required]),
        distributionsSelect: new FormControl(undefined, [
            Validators.required,
            Validators.minLength(1),
        ]),
    });

    // User select
    projects: Array<Project>;
    distributions: Array<Distribution>;

    subscriptions: Array<Subscription>;

    graphs: Array<Graph>;

//
// ─── INITIALIZATION ─────────────────────────────────────────────────────────────
//

    constructor(
        private userService: UserService,
        private projectService: ProjectService,
        private distributionService: DistributionService,
        private indicatorService: IndicatorService,
        public languageService: LanguageService,
        private datePipe: DatePipe,
        private countriesService: CountriesService,
    ) {}



    ngOnInit(): void {
        this.resetForms();
        this.generateFrequencies();
        this.generateEnabledReports();
        this.getProjects();

        this.generateFormsEvents();

        this.selectDefault();
    }

    // Unsubscribe from all observable to prevent memory leaks on component destruction
    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    private getProjects() {
        this.projectService.get().subscribe((apiProjects: Array<any>) => {
            this.projects = apiProjects.map((apiProject: any) => {
                return Project.apiToModel(apiProject);
            });
        });
    }

    // Generate the reports types
    private generateEnabledReports() {
        if (this.userService.hasRights('ROLE_REPORTING_COUNTRY')) {
            this.enabledReports.push(
                {
                    icon: 'settings/api',
                    title: this.language.report_country_report,
                    value: 'countries',
                },
            );
        }
        if (this.userService.hasRights('ROLE_REPORTING_PROJECT')) {
            this.enabledReports.push(
                {
                    icon: 'reporting/projects',
                    title: this.language.report_project_report,
                    value: 'projects',
                },
            );
        }

        this.enabledReports.push(
            {
                icon: 'reporting/distribution',
                title: this.language.report_distribution_report,
                value: 'distributions',
            },
        );

    }

    private generateFrequencies() {

        // Data Button Declaration
        this.enabledFrequencies = [
                { label: this.language.report_filter_per_year, value: 'year' },
                { label: this.language.report_filter_per_quarter, value: 'quarter' },
                { label: this.language.report_filter_per_month, value: 'month' },
            ];
    }

    private selectDefault() {
        this.selectReport(this.enabledReports[0]);
        this.selectFrequency(this.enabledFrequencies[0]);
    }
//
// ─── FORM CHANGES SUBSRIPTIONS ──────────────────────────────────────────────────
//

    private generateFormsEvents() {
        this.subscriptions = [
            // Send request when project report form is valid
            this.projectsControl.statusChanges.pipe(
                filter((event) => event === 'VALID' )
            ).subscribe((_: any) => {
                this.onFilterChange();
            }),

            // Update distributions on project change in distribution report
            this.distributionsControl.controls.projectSelect.valueChanges.subscribe((project: Project) => {
                if (!project) {
                    return;
                }
                // Remove any selected distributions on project select
                this.distributionsControl.controls.distributionsSelect.reset();
                // Get project's distributions
                this.distributionService.getByProject(project.get<number>('id'))
                    .subscribe((apiDistributions: Array<any>) => {
                        this.distributions = apiDistributions.map((apiDistribution: any) => {
                            return Distribution.apiToModel(apiDistribution);
                    });
                });
            }),

            // Send request when distribution report form is valid
            this.distributionsControl.statusChanges.pipe(
                filter((event) => event === 'VALID' )
            ).subscribe((_: any) => {
                this.onFilterChange();
            }),
            // Send request when period report form is valid
            this.periodControl.statusChanges.pipe(
                filter((event) => event === 'VALID' )
            ).subscribe((_: any) => {
                this.onFilterChange();
            }),
        ];
    }

    // Helper function: reset all forms
    private resetForms() {
        this.projectsControl.reset();
        this.distributionsControl.reset();
    }

    selectReport(clickedReport: object) {
        this.resetForms();
        const selectedReports = this.enabledReports.filter((report: object) => {
            if (report === clickedReport) {
                return report;
            }
        });
        this.selectedReport = selectedReports.length ? selectedReports[0] : this.enabledReports[0];

        this.onFilterChange();
    }

    // Called on frequency button press
    selectFrequency(clickedFrequency: object) {
        const selectedFrequencies = this.enabledFrequencies.filter((report: object) => {
            if (report === clickedFrequency) {
                return report;
            }
        });

        this.selectedFrequency = selectedFrequencies.length ? selectedFrequencies[0] : undefined;
        this.onFilterChange();
    }

    // Called on period button press
    togglePeriod() {
        this.periodMode = ! this.periodMode;
        this.onFilterChange();
    }

    // Prevent unnecessary calls to the api on filter change
    private onFilterChange() {

        // In the event where no report/frequency is selected, do nothing
        if (!this.selectedReport || !this.selectedFrequency) {
            return;
        }

        // If period is selected, check for period form validity
        if (this.periodMode) {
            if (! this.periodControl.valid) {
                return;
            }
        }

        // If distributions is selected, check for distributions form validity
        if (this.selectedReport.value === 'distributions') {
            if (! this.distributionsControl.valid) {
                return;
            }
        }
        // If projects is selected, check for projects form validity
        if (this.selectedReport.value === 'projects') {
            if (! this.projectsControl.valid) {
                return;
            }
        }

        // Update only if every field is correclty filled
        this.updateReports();
    }

//
// ─── PREPARE DATA FOR API ───────────────────────────────────────────────────────
//

    private updateReports() {

        this.indicatorService.getAllGraphs({
        ...this.generateReport(),
        ...this.generateFrequency(),
        ...this.generateCountry(),
        }).subscribe((graphsDTO: Array<GraphDTO>) => {
            this.graphs = graphsDTO.map((graphDTO: GraphDTO) => {
                return new Graph(graphDTO);
            });
        });
    }

    // Map reports for api
    // The value in the code and the one sent to the API are not necessarily the same
    private generateReport(): object {
        let report: string;
        let distributions: Array<Distribution>;
        let projects: Array<string>;

        switch (this.selectedReport.value) {
            case('projects'):
                report = 'projects';
                projects = this.projectsControl.value.projectsSelect.map((selectedProject: Project) => {
                    return selectedProject.get<string>('id');
                });
                break;
            case('distributions'):
                report = 'distributions';
                projects = [(this.distributionsControl.value.projectSelect as Project).get<string>('id')];
                distributions = this.distributionsControl.value.distributionsSelect.map((selectedDistribution: Distribution) => {
                    return selectedDistribution.get<string>('id');
                });
                break;
            case('countries'):
            default:
                report = 'countries';
                break;
        }
        return {report, distributions, projects};
    }

    // Map frequencies for api
    // The value in the code and the one sent to the API are not necessarily the same
    private generateFrequency(): object {
        let frequency: string;
        switch (this.selectedFrequency.value) {
            case('year'):
                frequency = 'Year';
                break;
            case('quarter'):
                frequency = 'Quarter';
                break;
            case('month'):
            default:
                frequency = 'Month';
        }
            if (this.periodMode) {
                return {
                    frequency,
                    period: [
                        this.datePipe.transform(this.periodControl.value.startDate, 'dd-MM-yyyy'),
                        this.datePipe.transform(this.periodControl.value.endDate, 'dd-MM-yyyy'),
                    ]
                };
            }
            return {
                frequency,
            };
    }

    private generateCountry(): object {
        return {country: this.countriesService.selectedCountry.value.get<string>('id')};
    }

    public graphValuesAreEmpty(graph: Graph): boolean {
        if (Object.keys(graph.values).length === 0) {
            return true;
        }
        return false;
    }
}
