import { TitleCasePipe } from '@angular/common';
// tslint:disable-next-line
import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Distribution } from 'src/app/model/distribution';
import { Project } from 'src/app/model/project';
import { DisplayType } from 'src/constants/screen-sizes';
import { DistributionService } from '../../../core/api/distribution.service';
import { ProjectService } from '../../../core/api/project.service';
import { UserService } from '../../../core/api/user.service';
import { FilterEvent, FilterInterface } from '../../../model/filter';
import { ButtonFilterDateComponent } from '../filters/button-filter/button-filter-data/button-filter-date.component';
import { ButtonFilterData } from '../filters/button-filter/button-filter.component';
import { ChartRegistration } from '../services/chart-registration.service';
import { IndicatorService } from '../services/indicator.service';

@Component({
    selector: 'app-indicator-page',
    templateUrl: './indicator-page.component.html',
    styleUrls: ['./indicator-page.component.scss']
})
export class IndicatorPageComponent implements OnInit, OnDestroy {
    from = new FormControl('', [Validators.required]);
    to = new FormControl('', [Validators.required]);

    @ViewChild('chart') chartDiv;
    @ViewChildren(MatOption) matoption: QueryList<MatOption>;
    @ViewChildren(ButtonFilterDateComponent) buttonFilters: QueryList<ButtonFilterDateComponent>;

    @Output() emitFilter: EventEmitter<FilterEvent> = new EventEmitter();

    public type = 'Country';
    public oldType = 'Country';
    public filters: Map<string, FilterInterface> = new Map<string, FilterInterface>();
    public body: any = [];
    public indicators: any[] = [];
    public filtersButton;
    public frequency = 'Month';
    public frequencyChanged = false;
    public chartDimensions: number[];
    public indicatorsLoading = false;
    public period = false;
    public selectPeriodDisplay;
    public display = true;
    public selectedPeriodFrequency = 'Period';
    public allMatOption;
    public isDownloading = false;

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    // // Data Button Declaration
    // public dataFilter1: Array<ButtonFilterData> = [
    //     { level: '1', label: this.toTitleCase(this.language.report_filter_per_year), value: 'Year', active: false },
    //     { level: '1', label: this.toTitleCase(this.language.report_filter_per_quarter), value: 'Quarter', active: false },
    //     { level: '1', label: this.toTitleCase(this.language.report_filter_per_month), value: 'Month', active: true },
    //     { level: '1', label: this.toTitleCase(this.language.report_filter_chose_periode), value: 'Period', active: false },
    // ];

    public dataFilter2: Array<ButtonFilterData> = [];

    // variable for display name of project and distribution in selectors
    public projects: Array<Project> = [];
    public distributions: Array<Distribution> = [];

    // array to know which project or distribution are selected
    public selectedProject: Project[] = [];
    public selectedDistribution: Distribution[] = [];

    // Defines the type of the file to export
    exportFileType = 'xls';

    // Controls
    filterControl = new FormGroup({
        projectSingleSelect: new FormControl(undefined),
        projectMultipleSelect: new FormControl(undefined, [Validators.minLength(1)]),
        distributionSelect: new FormControl(undefined, [Validators.minLength(1)])
    });

    private formControlSubscription: Subscription;
    private projectControlSubscription: Subscription;

    constructor(
        public titleCase: TitleCasePipe,
        public indicatorService: IndicatorService,
        public cacheService: AsyncacheService,
        public chartRegistrationService: ChartRegistration,
        public projectService: ProjectService,
        public distributionService: DistributionService,
        private snackBar: SnackbarService,
        private userService: UserService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
    ) {
    }

    ngOnInit() {

        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });

        // Get all projects
        this.projectService.get().subscribe((apiProjects: Array<any>) => {
            this.projects = apiProjects.map((apiProject: any) => {
                return Project.apiToModel(apiProject);
            });
        });

        this.formControlSubscription = this.filterControl.valueChanges.subscribe((_: any) => {
            // TODO: Update charts here
        });

        // Get project's distributions when project is changed
        this.projectControlSubscription = this.filterControl.get('projectSingleSelect').valueChanges.subscribe((projectId: number) => {
            this.onProjectChange(projectId);
        });

        // if (!this.indicatorsLoading) {
        //     this.indicatorsLoading = true;
        //     this.indicatorService.getIndicators()
        //         .pipe(
        //             finalize(() => this.indicatorsLoading = false)
        //         )
        //         .subscribe(response => {
        //             if (response) {
        //                 const indicatorResponse = Indicator.FormatArray(response);
        //                 for (let i = 0; i < indicatorResponse.length; i++) {
        //                     this.indicators.push(indicatorResponse[i]);
        //                 }
        //             } else {
        //                 this.indicators = null;
        //             }
        //         }, () => {
        //             this.indicators = null;
        //         });
        // }
        // this.generateReportsCards();

    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
        this.formControlSubscription.unsubscribe();
    }

    onProjectChange(projectId: number) {
        this.distributionService.getByProject(projectId).subscribe((apiDistributions: Array<any>) => {
            this.distributions = apiDistributions.map((apiDistribution: any) => {
                return Distribution.apiToModel(apiDistribution);
            });
        });
    }

    // ngAfterViewInit() {
    //     if (this.chartDiv) {
    //         this.chartDimensions = [400, 300];
    //     }
    //     // Get button reference in the template and store it in variable
    //     this.filtersButton = this.buttonFilters;
    //     this.allMatOption = this.matoption;
    // }

    // /**
    //  * check if the langage has changed
    //  */
    // ngDoCheck() {

    //     if (this.type !== this.oldType) {
    //         this.oldType = this.type;
    //         this.dataFilter1.forEach(filterDate => {
    //             if (filterDate['value'] === 'Month') {
    //                 this.frequency = filterDate['value'];
    //                 filterDate['active'] = true;
    //                 this.period = false;
    //                 this.selectedPeriodFrequency = 'Period';
    //             } else {
    //                 filterDate['active'] = false;
    //             }
    //         });
    //     }
    // }

    // /**
    //  * Call the function to connect a chart with its filters
    //  * @param e
    //  */
    // onFilter(e: FilterEvent) {
    //     ChartRegistration.associations
    //         .forEach((item: RegisteredItem, index: number, array: RegisteredItem[]) => {
    //             if (item.filterId === AbstractFilter.formatFullname(e.page, e.id)) {
    //                 const filter = this.filters.get(item.filterId);
    //                 this.chartRegistrationService.updateAssociation(index, e.data);
    //             }
    //         });

    //     // Verify the type (here : Country, Project, Distribution) to display the good charts
    //     if (e.id === 'bms') {
    //         this.dataFilter2.forEach(filter => {
    //             if (filter['active']) {
    //                 this.type = filter['value'];
    //                 this.selectedProject = [];
    //                 if (this.type === 'Distribution') {
    //                     this.display = false;
    //                 } else {
    //                     this.display = true;
    //                 }
    //             }
    //         });
    //     } else if (e.id === 'frequency') {
    //         // Verify the frequency selected
    //         this.dataFilter1.forEach(filter => {
    //             if (filter['active']) {
    //                 this.frequency = filter['value'];
    //                 if (filter['value'] === 'Period') {
    //                     this.period = true;
    //                 } else {
    //                     this.period = false;
    //                     this.selectedPeriodFrequency = 'Period';
    //                 }
    //             }
    //         });
    //     }



    // }

    // /**
    //  * Update local variable filters with filters in parameters
    //  * @param filters
    //  */
    // updateFilters(filters: FilterInterface[]): Array<FilterInterface> {
    //     filters.forEach((filter: FilterInterface) => {
    //         this.filters.set(filter.getFullname(), filter);
    //     });
    //     return filters;
    // }

    // /**
    //  * Compare indicator's filter and the filter in the page
    //  * to create the good association
    //  * @param filtersIndicator
    //  */
    // findFilter(filtersIndicator: string[]) {
    //     const filters: Array<FilterInterface> = [];
    //     this.filtersButton._results.forEach(filterButton => {
    //         filtersIndicator.forEach(filter => {
    //             if (filter === filterButton.referenceKey) {
    //                 filters.push(filterButton);
    //             }
    //         });
    //     });
    //     if (filters.length) {
    //         return this.updateFilters(filters);
    //     }
    //     return filters;
    // }

    // updateFiltersWithLanguage() {
    //     this.dataFilter1[0].label = this.toTitleCase(this.language.report_filter_per_year);
    //     this.dataFilter1[1].label = this.toTitleCase(this.language.report_filter_per_quarter);
    //     this.dataFilter1[2].label = this.toTitleCase(this.language.report_filter_per_month);

    //     this.dataFilter2[0].label = this.toTitleCase(this.language.report_country_report);
    //     this.dataFilter2[1].label = this.toTitleCase(this.language.report_project_report);
    //     this.dataFilter2[2].label = this.toTitleCase(this.language.report_distribution_report);
    // }


    // applyPeriod(from, to) {
    //     const dateFrom = from.split('/');
    //     if (dateFrom[0].length < 2) {
    //         dateFrom[0] = '0' + dateFrom[0];
    //     }
    //     if (dateFrom[1].length < 2) {
    //         dateFrom[1] = '0' + dateFrom[1];
    //     }

    //     const dateTo = to.split('/');
    //     if (dateTo[0].length < 2) {
    //         dateTo[0] = '0' + dateTo[0];
    //     }
    //     if (dateTo[1].length < 2) {
    //         dateTo[1] = '0' + dateTo[1];
    //     }
    //     from = dateFrom[0] + '/' + dateFrom[1] + '/' + dateFrom[2];
    //     to = dateTo[0] + '/' + dateTo[1] + '/' + dateTo[2];
    //     this.selectedPeriodFrequency = from + '-' + to;
    // }

    // generateReportsCards() {
    //     if (this.userService.hasRights('ROLE_REPORTING_COUNTRY')) {
    //         this.dataFilter2.push(
    //             {
    //                 level: '0', icon: 'settings/api', color: 'green',
    //                 label: this.toTitleCase(this.language.report_country_report), value: 'Country', active: false,
    //             },
    //         );
    //         this.onFilter(new FilterEvent('bms', 'reporting', 'Country'));
    //     }

    //     if (this.userService.hasRights('ROLE_REPORTING_PROJECT')) {
    //         this.dataFilter2.push(
    //             {
    //                 level: '0', icon: 'reporting/projects', color: 'green',
    //                 label: this.toTitleCase(this.language.report_project_report), value: 'Project', active: false,
    //             },
    //         );
    //         this.onFilter(new FilterEvent('bms', 'reporting', 'Project'));
    //     }

    //     this.dataFilter2.push(
    //         {
    //             level: '0', icon: 'reporting/distribution', color: 'green',
    //             label: this.toTitleCase(this.language.report_distribution_report), value: 'Distribution', active: false,
    //         },
    //     );
    // }

    // /**
    //  * Export the reporting data in one of the following format:
    //  * xls, csv, ods or pdf
    //  */
    // export() {
    //     this.isDownloading = true;

    //     // If we choose a period, we get the value from selectedPeriodFrequency
    //     const frequency = this.frequency !== 'Period' ? this.frequency : this.selectedPeriodFrequency;

    //     // If the format is not a pdf, we generate the export in the API
    //     if (this.exportFileType !== 'pdf') {
    //         // Select the desired indicators and format them in the format id,id,id,...
    //         const indicatorsId = this.indicators
    //             .filter(indicator => indicator.type === this.type)
    //             .map(indicator => indicator.id);

    //         // Format the projects and the distributions like the indicators above
    //         const projects = this.selectedProject.length > 0 ? this.selectedProject : this.projects;
    //         const projectsId = projects.map((project: Project) => project.get<number>('id'));
    //         const distributions = this.selectedDistribution.length > 0 ? this.selectedDistribution : this.distributions;
    //         const distributionsId =  distributions.map(distribution => distribution.get<number>('id'));

    //         // Call the service to get the data we want
    //         this.indicatorService.exportReportData(indicatorsId, frequency, projectsId, distributionsId, this.exportFileType)
    //         .subscribe(response => {
    //             this.isDownloading = false;
    //             // Force download
    //             if (response) {
    //                 saveAs(response, 'reports.' +  this.exportFileType);
    //             } else {
    //                 this.snackBar.warning('No data to export');
    //             }
    //         }, err => {
    //             this.snackBar.error(err.error.message);
    //             this.isDownloading = false;
    //         });
    //     }
    //     else {
    //         const charts = document.getElementsByClassName('indicatorChart');
    //         const doc = new jsPDF('l', 'px', 'a4');
    //         const pageWidth = doc.internal.pageSize.getWidth();
    //         const pageHeight = doc.internal.pageSize.getHeight();
    //         const collection = [];
    //         const timestamp = new Date();

    //         // SETTING TITLE, PROJECT, AND DISTRIBUTION TEXT
    //         doc.setFontSize(20);
    //         doc.text(`${this.type} Report by ${this.frequency}`, pageWidth / 2, 30, 'center');

    //         if (this.type === 'Project' && this.selectedProject.length > 0 ||
    //             this.type === 'Distribution' && this.selectedProject.length > 0) {

    //             doc.setFontSize(15);
    //             doc.text(
        // `Projects: ${this.projects.map((project: Project) => project.get<string>('name'))}`, pageWidth / 2, 50, 'center'
        // );

    //             if (this.type === 'Distribution' && this.selectedDistribution.length > 0) {
    //                 const distributionTitle =
    //                     `Distributions: ${this.distributions.map((distribution: Distribution) => distribution.get<string>('name'))}`;
    //                 const splitLength = doc.splitTextToSize(distributionTitle, pageWidth - 50);
    //                 doc.text(splitLength, pageWidth / 2, 70, 'center');
    //             }
    //         }
    //         // SAVING CHARTS TO IMAGES
    //         for (let i = 0; i < charts.length; i++) {
    //             const canvasImg = html2canvas(charts[i], { width: 800, height: 800, scale: 2 });
    //             collection.push(canvasImg);
    //         }
    //         // ADDING IMAGES TO DOCUMENT
    //         Promise.all(collection)
    //             .then(response => {
    //                 response.forEach((e, i) => {
    //                     const imgData = e.toDataURL('img/png');
    //                     doc.addImage(imgData, 'PNG', 110, 100, pageWidth, pageHeight + 100, null, 'FAST');
    //                     if (i !== response.length - 1) {
    //                         doc.addPage();
    //                     }
    //                 });
    //             })
    //             .then(() => {
    //                 doc.save(`${this.type} Report ${timestamp.getDay()}/${timestamp.getMonth() + 1}/${timestamp.getFullYear()}.pdf`);
    //                 this.isDownloading = false;
    //             });
    //     }
    // }
}
