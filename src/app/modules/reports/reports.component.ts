import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { saveAs } from 'file-saver/FileSaver';
import * as html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { forkJoin, from, of, Subscription } from 'rxjs';
import { filter, map, switchMap, tap, mergeMap } from 'rxjs/operators';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { UserService } from 'src/app/core/api/user.service';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { Distribution } from 'src/app/models/distribution';
import { Project } from 'src/app/models/project';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { GraphDTO } from './models/graph.dto';
import { Graph } from './models/graph.model';
import { IndicatorService } from './services/indicator.service';

const PDFConfig = {
    paperWidthMm : 210,
    paperHeightMm : 297,
    singleMarginMm : 10,
    graphPerLine : 2,
    graphRatioHW : 5 / 4,
};

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss'],
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

    // Variable set to false while changing the distributions for a project to prevent multiple api calls
    projectDistributionsMismatch = false;

    // User select
    projects: Array<Project>;
    distributions: Array<Distribution>;

    subscriptions: Array<Subscription>;
    getAllSubscription: Subscription;

    // Graphs
    graphs: Array<Graph>;

    // Export
    exportFileType = 'csv';
    isDownloading = false;

    // ScreenSize
    displayType: DisplayType;
    canvasAreReloading = false;


    public initializing = true;
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
        private screenSizeService: ScreenSizeService,
    ) {}

    ngOnInit(): void {
        this.generateFrequencies();
        this.generateEnabledReports();
        this.getProjects().pipe(
            mergeMap(() => {
                if (!this.projects) {
                    return of(undefined);
                }
                return this.setFormsValues();
            })
        ).subscribe((_: any) => {
            this.generateFormsEvents();
            this.selectDefault();

            this.screenSizeService.displayTypeSource.subscribe((_displayType: DisplayType) => {
                this.canvasAreReloading = true;
                // Recreate the canvas to resize them correctly
                setTimeout(() => {this.canvasAreReloading = false; }, 0);
            });
            this.initializing = false;
        });


    }

    // Unsubscribe from all observable to prevent memory leaks on component destruction
    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    private getProjects() {
        return this.projectService.get().pipe(
            map((apiProjects: Array<any>) => {

                if (apiProjects) {
                    this.projects = apiProjects.map((apiProject: any) => {
                        return Project.apiToModel(apiProject);
                    });
                }
                return this.projects;
            })
        );
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
// ─── FORM CHANGES SUBSCRIPTIONS ─────────────────────────────────────────────────
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
            this.distributionsControl.controls.projectSelect.valueChanges.pipe(
                switchMap((projectId: number) => {
                    this.projectDistributionsMismatch = true;
                    if (!projectId) {
                        return of(undefined);
                    }
                    // Remove any selected distributions on project select
                    this.distributionsControl.controls.distributionsSelect.reset();
                    // Get project's distributions, emit an event when filling the distribs
                    return this.fillDistributionFromProject(projectId, true);
                }
            )).subscribe(),

            // Send request when distribution report form is valid
            this.distributionsControl.statusChanges.pipe(
                filter((event) => event === 'VALID' ),
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

    // Helper function: set all forms' values
    private setFormsValues() {
        if (!this.projects || !this.projects.length) {
            return of(undefined);
        }
        this.projectsControl.get('projectsSelect').setValue(this.projects.map((project: Project) => project.get('id')), {emitEvent: false});
        const firstProjectId = this.projects[0].get<number>('id');
        this.distributionsControl.get('projectSelect').setValue(firstProjectId, {emitEvent: false});
        return this.fillDistributionFromProject(firstProjectId, false);
    }

    fillDistributionFromProject(projectId: number, emitEvent?: boolean) {

        return this.distributionService.getByProject(projectId).pipe(
            tap((apiDistributions: Array<any>) => {
                if (apiDistributions || apiDistributions === []) {
                    this.distributions = apiDistributions.map((apiDistribution: any) => {
                        return Distribution.apiToModel(apiDistribution);
                    });
                    this.distributionsControl.get('distributionsSelect')
                        .setValue(this.distributions.map((distribution: Distribution) => {
                            return distribution.get<number>('id');
                        }), {emitEvent: emitEvent}
                    );
                    this.projectDistributionsMismatch = false;
                }
            }
        ));
    }

    selectReport(clickedReport: object) {
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
        // If the page is still initializing
        if (this.initializing) {
            return;
        }
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
            if (this.projectDistributionsMismatch) {
                return;
            }
        }
        // If projects is selected, check for projects form validity
        if (this.selectedReport.value === 'projects') {
            if (! this.projectsControl.valid) {
                return;
            }
        }

        // Update only if every field is correctly filled
        this.updateReports();
    }

//
// ─── PREPARE DATA FOR API ───────────────────────────────────────────────────────
//
    private updateReports() {
        // Cancel previous api call
        if (this.getAllSubscription) {
            this.getAllSubscription.unsubscribe();
        }
        // Renew it
        this.getAllSubscription = this.indicatorService.getAllGraphs(this.generateFilters())
            .subscribe((graphsDTO: Array<GraphDTO>) => {
            this.graphs = graphsDTO.map((graphDTO: GraphDTO) => {
                return new Graph(graphDTO);
            });
        });
    }

    private generateFilters() {
        return {
            ...this.generateReport(),
            ...this.generateFrequency(),
            ...this.generateCountry(),
        };
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
                projects = this.projectsControl.value.projectsSelect;
                break;
            case('distributions'):
                report = 'distributions';
                projects = [this.distributionsControl.value.projectSelect];
                distributions = this.distributionsControl.value.distributionsSelect.map((selectedDistribution: Distribution) => {
                    return selectedDistribution;
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
        return {country: this.countriesService.selectedCountry.get<string>('id')};
    }

//
// ─── DATA CHECKING ──────────────────────────────────────────────────────────────
//
    public graphValuesAreEmpty(graph: Graph): boolean {
        if (Object.keys(graph.values).length === 0) {
            return true;
        }
        return false;
    }

//
// ─── EXPORT ─────────────────────────────────────────────────────────────────────
//

    public export(exportFileType: string) {
        this.isDownloading = true;
        switch (exportFileType) {
            case 'xls':
            case 'csv':
            case 'ods':
                this.indicatorService.exportReportData(
                    this.generateFilters(),
                    exportFileType
                ).subscribe((file: File) => {
                        saveAs(file, `reporting.${exportFileType}`);
                        this.isDownloading = false;

                    });
            break;
            case 'pdf':
            default:
                this.generatePdf();
        }
    }

    private generatePdf() {
        const htmlGraphs = document.getElementsByClassName('graph');

        const graphWidthMm = (PDFConfig.paperWidthMm - (PDFConfig.graphPerLine + 1) * PDFConfig.singleMarginMm) / PDFConfig.graphPerLine;
        const graphHeightMm = graphWidthMm * PDFConfig.graphRatioHW;

        const options: Html2Canvas.Html2CanvasOptions = {
            width: 400,
            height: 500,
        };
        const pdf = new jsPDF('p', 'mm', 'A4');
        let x = 0, y = 0;
        // Gather observables used for converting html elements to canvas
        forkJoin(
            Array.from(htmlGraphs).map((htmlGraph: HTMLElement, index: number) => {
                return from(html2canvas(htmlGraph, options)).pipe(
                    tap((canvas: HTMLCanvasElement) => {
                        const img = canvas.toDataURL('image/jpeg', 1.0);
                        pdf.addImage(img, 'JPEG', x + PDFConfig.singleMarginMm, y + PDFConfig.singleMarginMm, graphWidthMm, graphHeightMm);

                        // Calculate next graph's coordinates
                        x += PDFConfig.singleMarginMm + graphWidthMm;
                        if (PDFConfig.paperWidthMm - x < graphWidthMm) {
                            x = 0;
                            y += PDFConfig.singleMarginMm + graphHeightMm;
                            if (PDFConfig.paperHeightMm - y < graphHeightMm) {
                                y = 0;
                                pdf.addPage();
                            }
                        }
                    })
                );
            })
        ).subscribe(() => {
            pdf.save('Reports');
            this.isDownloading = false;
        });
    }

//
// ─── NG SELECT HEADERS ──────────────────────────────────────────────────────────
//
    public selectAll(control: FormControl, entities: Array<CustomModel>) {
        control.setValue(entities.map((entity: CustomModel) => entity.get('id')));
    }
}
