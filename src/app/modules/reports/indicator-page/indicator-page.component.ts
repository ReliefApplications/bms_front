import { Component, OnInit, ViewChild, SimpleChanges, ElementRef, ViewChildren, QueryList, HostListener, Output, EventEmitter } from '@angular/core';
import { IndicatorService } from '../services/indicator.service';
import { FilterEvent, FilterInterface, AbstractFilter } from '../../../model/filter';
import { Indicator } from '../../../model/indicator';
import { ButtonFilterData, ButtonFilterComponent } from '../filters/button-filter/button-filter.component';
import { ChartRegistration, RegisteredItem } from '../services/chart-registration.service';
import { forEach } from '@angular/router/src/utils/collection';
import { MAT_CHIPS_DEFAULT_OPTIONS, MatButton, MatSelect, MatOption } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { GlobalText } from '../../../../texts/global';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { DistributionService } from '../../../core/api/distribution.service';
import { DistributionData } from '../../../model/distribution-data';
import { filterQueryId } from '@angular/core/src/view/util';
import { ButtonFilterDateComponent } from '../filters/button-filter/button-filter-data/button-filter-date.component';
import { finalize } from 'rxjs/operators';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TitleCasePipe } from '@angular/common'; 


@Component({
    selector: 'app-indicator-page',
    templateUrl: './indicator-page.component.html',
    styleUrls: ['./indicator-page.component.scss']
})
export class IndicatorPageComponent implements OnInit {
    public indicator = GlobalText.TEXTS;
    from = new FormControl('', [Validators.required]);
    to = new FormControl('', [Validators.required]);

    @ViewChild('chart') chartDiv;
    @ViewChildren(MatOption) matoption: QueryList<MatOption>;
    @ViewChildren(ButtonFilterDateComponent) buttonFilters: QueryList<ButtonFilterDateComponent>;

    @Output() emitFilter: EventEmitter<FilterEvent> = new EventEmitter();

    public type = "Country";
    public oldType = "Country";
    public filters: Map<string, FilterInterface> = new Map<string, FilterInterface>();
    public body: any = [];
    public indicators: any[] = [];
    public filtersButton;
    public frequency = "Month";
    public frequencyChanged = false;
    public chartDimensions: number[];
    public indicatorsLoading = false;
    public period: boolean = false;
    public selectPeriodDisplay;
    public display: boolean = true;
    public selectedPeriodFrequency: string = 'Period';
    public allMatOption;
    public isDownloading = false;

    //for responsive design
    public maxHeight = 700;
    public maxWidthMobile = 750;
    public maxWidthFirstRow = 1000;
    public maxWidthSecondRow = 800;
    public maxWidth = 750;
    public heightScreen;
    public widthScreen;
     

    // Data Button Declaration
    public dataFilter1: Array<ButtonFilterData> = [
        { level: '1', label: this.toTitleCase(this.indicator.report_filter_per_year), value: 'Year', active: false },
        { level: '1', label: this.toTitleCase(this.indicator.report_filter_per_quarter), value: 'Quarter', active: false },
        { level: '1', label: this.toTitleCase(this.indicator.report_filter_per_month), value: 'Month', active: true },
        { level: '1', label: this.toTitleCase(this.indicator.report_filter_chose_periode), value: 'Period', active: false },
    ]

    public dataFilter2: Array<ButtonFilterData> = [];

    //variable for display name of project and distribution in selectors
    public projectList: string[] = [];
    public distributionList: string[] = [];

    //array to know which project or distribution are selected 
    public selectedProject: string[] = [];
    public selectedDistribution: string[] = [];

    constructor(
        public titleCase:TitleCasePipe,
        public indicatorService: IndicatorService,
        public cacheService: AsyncacheService,
        public chartRegistrationService: ChartRegistration,
        public projectService: ProjectService,
        public distributionService: DistributionService
    ) {
    }

    ngOnInit() {
        this.checkPermission();
        this.checkSize();
        this.getProjects();

        if (!this.indicatorsLoading) {
            this.indicatorsLoading = true;
            this.indicatorService.getIndicators()
            .pipe(
                finalize(
                    () => {
                        this.indicatorsLoading = false;
                    }
                )
            ).toPromise()
            .then(response => {
                if(response) {
                    let indicatorResponse = Indicator.FormatArray(response);
                    for (let i = 0; i < indicatorResponse.length; i++) {
                        this.indicators.push(indicatorResponse[i]);
                    }
                } else {
                    this.indicators = null;
                }
            }).catch(e => {
                this.indicators = null;
            });
        }

    }

    toTitleCase(filtreType :string){
        return this.titleCase.transform(filtreType);
    }

    ngAfterViewInit() {
        if (this.chartDiv) {
            this.chartDimensions = [400, 300];
        }
        //Get button reference in the template and store it in variable
        this.filtersButton = this.buttonFilters;
        this.allMatOption = this.matoption;
    }

    /**
            * check if the langage has changed
            */
    ngDoCheck() {
        if (this.indicator != GlobalText.TEXTS) {
            this.indicator = GlobalText.TEXTS;
            this.updateFiltersWithLanguage();
        }
        if (this.type !== this.oldType) {
            this.oldType = this.type;
            this.dataFilter1.forEach(filterDate => {
                if (filterDate['value'] === 'Month') {
                    this.frequency = filterDate['value'];
                    filterDate['active'] = true;
                    this.period = false;
                    this.selectedPeriodFrequency = 'Period';
                } else {
                    filterDate['active'] = false
                }
            });
        }
    }

    /**
     * Call the function to connect a chart with its filters
     * @param e 
     */
    onFilter(e: FilterEvent) {
        ChartRegistration.associations
            .forEach((item: RegisteredItem, index: number, array: RegisteredItem[]) => {
                if (item.filterId === AbstractFilter.formatFullname(e.page, e.id)) {
                    const filter = this.filters.get(item.filterId);
                    this.chartRegistrationService.updateAssociation(index, e.data);
                }
            });

        //Verify the type (here : Country, Project, Distribution) to display the good charts
        if (e.id === "bms") {
            this.dataFilter2.forEach(filter => {
                if (filter['active']) {
                    this.type = filter['value'];
                    this.selectedProject = [];
                    if (this.type == 'Distribution') {
                        this.display = false;
                    }
                    else {
                        this.display = true;
                    }
                }
            });
        } else if (e.id === "frequency") {
            //Verify the frequency selected
            this.dataFilter1.forEach(filter => {
                if (filter['active']) {
                    this.frequency = filter['value'];
                    if (filter['value'] === "Period") {
                        this.period = true;
                    } else {
                        this.period = false;
                        this.selectedPeriodFrequency = 'Period';
                    }
                }
            });
        }



    }

    /**
     * Update local variable filters with filters in parameters
     * @param filters 
     */
    updateFilters(filters: FilterInterface[]): Array<FilterInterface> {
        filters.forEach((filter: FilterInterface) => {
            this.filters.set(filter.getFullname(), filter);
        })
        return filters;
    }

    /**
     * Compare indicator's filter and the filter in the page 
     * to create the good association
     * @param filtersIndicator 
     */
    findFilter(filtersIndicator: string[]) {
        let filters: Array<FilterInterface> = [];
        this.filtersButton._results.forEach(filterButton => {
            filtersIndicator.forEach(filter => {
                if (filter == filterButton.referenceKey) {
                    filters.push(filterButton);
                }
            })
        });
        if (filters.length) {
            return this.updateFilters(filters);
        }
        return filters;
    }

    /**
     * For responsive design
     * @param event 
     */
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    /**
     * For responsive design
     */
    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    updateFiltersWithLanguage() {
        this.dataFilter1[0].label = this.toTitleCase(this.indicator.report_filter_per_year);
        this.dataFilter1[1].label = this.toTitleCase(this.indicator.report_filter_per_quarter);
        this.dataFilter1[2].label = this.toTitleCase(this.indicator.report_filter_per_month);

        this.dataFilter2[0].label = this.toTitleCase(this.indicator.report_country_report);
        this.dataFilter2[1].label = this.toTitleCase(this.indicator.report_project_report);
        this.dataFilter2[2].label = this.toTitleCase(this.indicator.report_distribution_report);
    }

    /**
     * Get list of all project and put it in the project selector
     */
    getProjects() {
        this.projectService.get().toPromise().then( response => {
            this.projectList = [];
            let Projectresponse = Project.formatArray(response);
            Projectresponse.forEach(element => {
                var concat = element.id + " - " + element.name;
                this.projectList.push(concat);
            });
        })
        // .catch(
        //     () => {
        //         this.projectList = null;
        //     }
        // );

    }

    /**
     * Get list of all distribution and put it in the distribution selector
     */
    getDistributions() {
        this.distributionList = [];
        this.distributionService.getByProject(this.selectedProject[0]).toPromise().then(response => {
            this.distributionList = [];
            let distributionResponse = DistributionData.formatArray(response);
            distributionResponse.forEach(element => {
                var concat = element.id + " - " + element.name;
                this.distributionList.push(concat);
            });
        })
        // .catch(
        //     () => {
        //         this.distributionList = null;
        //     }
        // );


    }

    /**
      * Get the project selected in the projectList selector
      * @param event 
      */
    getProjectSelected(event) {
        this.selectedProject = [];

        let value = event.value ? event.value : event;

        //to deselect mat-option when we change of project
        if (this.type === 'Distribution') {
            this.distributionList.forEach(distribution => {
                this.allMatOption.forEach(option => {
                    if (option.value === distribution) {
                        option.deselect();
                    }
                });
            });

            var project = value.split(" - ");
            this.selectedProject.push(project[0]);
            this.selectedDistribution = [];
            this.getDistributions();
            this.display = true;
        }

        else if (this.type === 'Project') {
            if (value < 1) {
                this.projectList.forEach(element => {
                    var project = element.split(" - ");
                    this.selectedProject.push(project[0]);
                });
            } else {
                value.forEach(element => {
                    var project = element.split(" - ");
                    this.selectedProject.push(project[0]);
                });
            }
        }
    }

    /**
     * Get the distribution selected in the distributionList selector
     * @param event 
     */
    getDistributionSelected(event) {
        let value = event.value ? event.value : event;

        this.selectedDistribution = [];
        if (value < 1) {
            this.distributionList.forEach(element => {
                var distribution = element.split(" - ");
                this.selectedDistribution.push(distribution[0]);
            });
        } else {
            value.forEach(element => {
                var distribution = element.split(" - ");
                this.selectedDistribution.push(distribution[0]);
            });
        }
    }

    applyPeriod(from, to) {
        var dateFrom = from.split('/');
        if (dateFrom[0].length < 2) {
            dateFrom[0] = "0" + dateFrom[0];
        }
        if (dateFrom[1].length < 2) {
            dateFrom[1] = "0" + dateFrom[1];
        }

        var dateTo = to.split('/');
        if (dateTo[0].length < 2) {
            dateTo[0] = "0" + dateTo[0];
        }
        if (dateTo[1].length < 2) {
            dateTo[1] = "0" + dateTo[1];
        }
        from = dateFrom[0] + '/' + dateFrom[1] + '/' + dateFrom[2];
        to = dateTo[0] + '/' + dateTo[1] + '/' + dateTo[2];
        this.selectedPeriodFrequency = from + '-' + to;
    }

    checkPermission() {
        this.cacheService.getUser().subscribe(
            result => {
                if(result && result.rights) {
                    const rights = result.rights;

                    if (rights == "ROLE_ADMIN" || rights == 'ROLE_REGIONAL_MANAGER' || rights == 'ROLE_COUNTRY_MANAGER') {
                        this.dataFilter2 = [
                            { level: '0', icon: 'settings/api', color: 'red', label: this.toTitleCase( this.indicator.report_country_report), value: 'Country', active: true },
                            { level: '0', icon: 'reporting/projects', color: 'green', label: this.toTitleCase(this.indicator.report_project_report), value: 'Project', active: false },
                            { level: '0', icon: 'reporting/distribution', color: 'red', label: this.toTitleCase(this.indicator.report_distribution_report), value: 'Distribution', active: false },
                        ];
            
                        this.onFilter(new FilterEvent('bms', 'reporting', 'Country'));
                    }
            
            
                    else if (rights == "ROLE_PROJECT_OFFICER" || rights == "ROLE_PROJECT_MANAGER") {
                        this.dataFilter2 = [
                            { level: '0', icon: 'reporting/projects', color: 'green', label: this.toTitleCase(this.indicator.report_project_report), value: 'Project', active: true },
                            { level: '0', icon: 'reporting/distribution', color: 'red', label: this.toTitleCase(this.indicator.report_distribution_report), value: 'Distribution', active: false },
                        ];
            
                        this.onFilter(new FilterEvent('bms', 'reporting', 'Project'));
                    }
                    else {
                        this.dataFilter2 = [
                            { level: '0', icon: 'reporting/distribution', color: 'red', label: this.toTitleCase(this.indicator.report_distribution_report), value: 'Distribution', active: true },
                        ];
            
                        this.onFilter(new FilterEvent('bms', 'reporting', 'Distribution'));
                    }
                }
            }
        )
    }

    // DOWNLOAD PDF OF GRAPHS
    downloadPDF() {
        this.isDownloading = true;
        let charts = document.getElementsByClassName('indicatorChart')
        let doc = new jsPDF('l', 'px', 'a4');
        let pageWidth = doc.internal.pageSize.getWidth();
        let pageHeight = doc.internal.pageSize.getHeight();
        let collection = []
        let timestamp = new Date();
        let projects:string[] = []
        let distributions:string[] = []

        // SETTING TITLE, PROJECT, AND DISTRIBUTION TEXT
        doc.setFontSize(20);
        doc.text(`${this.type} Report by ${this.frequency}`, pageWidth / 2, 30, 'center');

        if (this.type == "Project" && this.selectedProject.length > 0 || this.type == "Distribution" && this.selectedProject.length > 0) {
            this.projectList.map(e => {
                let splitted = e.split(' -');
                for (let i = 0; i < this.selectedProject.length; i++) {
                    splitted[0] == this.selectedProject[i] ? projects.push(splitted[1]) : 0;
                }
            })
            doc.setFontSize(15)
            doc.text(`Projects: ${projects.map(e => {return e})}`, pageWidth / 2, 50, 'center')

            if (this.type == 'Distribution' && this.selectedDistribution.length > 0) {
                this.distributionList.map(e => {
                    let splitted = e.split(' -');
                    for (let i = 0; i < this.selectedDistribution.length; i++) {
                        splitted[0] == this.selectedDistribution[i] ? distributions.push(splitted[1]) : 0;
                    }
                })
                let distributionTitle = `Distributions: ${distributions.map(e => {return e})}`
                let splitLength = doc.splitTextToSize(distributionTitle, pageWidth - 50)
                doc.text(splitLength, pageWidth / 2, 70, 'center')
            }
        }

        // SAVING CHARTS TO IMAGES
        for (let i = 0; i < charts.length; i++) {
            let canvasImg = html2canvas(charts[i], {width: 800, height: 800, scale: 2})
            collection.push(canvasImg)
        }

        // ADDING IMAGES TO DOCUMENT
        Promise.all(collection)
        .then(response => {
            response.forEach((e, i) => {
                let imgData = e.toDataURL('img/png');
                doc.addImage(imgData, 'PNG', 110, 100, pageWidth, pageHeight + 100, null, 'FAST')
                i !== response.length-1 ? doc.addPage() : 0;
            })
        })
        .then(() => {
            doc.save(`${this.type} Report ${timestamp.getDay()}/${timestamp.getMonth()+1}/${timestamp.getFullYear()}.pdf`);
            this.isDownloading = false;
        })
    }
}
