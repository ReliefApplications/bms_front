import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { UserService } from 'src/app/core/api/user.service';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { Distribution } from 'src/app/model/distribution';
import { Indicator } from 'src/app/model/indicator.new';
import { Project } from 'src/app/model/project';
import { IndicatorService } from './services/indicator.service';
@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {

    public enabledReports: Array<object> = [];
    public selectedReport: any = undefined;
    public enabledFrequencies: Array<object> = [];
    public selectedFrequency: any = undefined;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    // Choose period
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

    projects: Array<Project>;
    distributions: Array<Distribution>;

    subscriptions: Array<Subscription>;

    indicators: Array<Indicator>;

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
        this.getProjects();

        this.generateFormsEvents();

        this.generateEnabledReports();
        this.generateFrequencies();

        this.indicatorService.getIndicators()
            .subscribe((indicatorsFromApi: Array<any>) => {
                this.indicators = indicatorsFromApi.map((indicatorFromApi: any) => {
                    return Indicator.apiToModel(indicatorFromApi);
                });
            });
    }

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

        this.selectedReport = this.enabledReports[0];
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

    private generateFrequencies() {

        // Data Button Declaration
        this.enabledFrequencies = [
                { label: this.language.report_filter_per_year, value: 'year' },
                { label: this.language.report_filter_per_quarter, value: 'quarter' },
                { label: this.language.report_filter_per_month, value: 'month' },
                { label: this.language.report_filter_chose_periode, value: 'period' },
            ];
        this.selectedFrequency = this.enabledFrequencies[0];
    }

    selectFrequency(clickedFrequency: object) {
        this.periodControl.reset();
        const selectedFrequencies = this.enabledFrequencies.filter((report: object) => {
            if (report === clickedFrequency) {
                return report;
            }
        });

        this.selectedFrequency = selectedFrequencies.length ? selectedFrequencies[0] : undefined;

        this.onFilterChange();
    }

    private resetForms() {
        this.projectsControl.reset();
        this.periodControl.reset();
        this.distributionsControl.reset();
    }

    // Prevent unnecessary calls to the api on filter change
    private onFilterChange() {

        // If period is selected, check for period form validity
        if (this.selectedFrequency.value === 'period') {
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
        if (this.selectedReport.value === 'projects') {
            if (! this.projectsControl.valid) {
                return;
            }
        }

        this.updateReports();
    }

    private updateReports() {

        this.indicatorService.getAllGraphs({
        ...this.generateReport(),
        ...this.generateFrequency(),
        ...this.generateCountry(),
        }).subscribe();
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
        let period: Array<string>;
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
                break;
            case('period'):
                frequency = 'Period';
                period = [
                    this.datePipe.transform(this.periodControl.value.startDate, 'yyyy-mm-dd'),
                    this.datePipe.transform(this.periodControl.value.endDate, 'yyyy-mm-dd'),
                ];
                break;
        }
        return {frequency, period};
    }

    private generateCountry(): object {
        return {country: this.countriesService.selectedCountry.value.get<string>('id')};
    }
}
