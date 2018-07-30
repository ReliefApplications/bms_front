import { Component, OnInit, ViewChild, SimpleChanges, ElementRef, ViewChildren, QueryList, HostListener, Output, EventEmitter } from '@angular/core';
import { IndicatorService } from '../services/indicator.service';
import { FilterEvent, FilterInterface, AbstractFilter } from '../../../model/filter';
import { Indicator } from '../../../model/indicator';
import { CacheService } from '../../../core/storage/cache.service';
import { ButtonFilterData, ButtonFilterComponent } from '../filters/button-filter/button-filter.component';
import { ChartRegistration, RegisteredItem } from '../services/chart-registration.service';
import { forEach } from '@angular/router/src/utils/collection';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material';
import { FormControl } from '@angular/forms';
import { GlobalText } from '../../../../texts/global';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { DistributionService } from '../../../core/api/distribution.service';
import { DistributionData } from '../../../model/distribution-data';


@Component({
  selector: 'app-indicator-page',
  templateUrl: './indicator-page.component.html',
  styleUrls: ['./indicator-page.component.scss']
})
export class IndicatorPageComponent implements OnInit {
  public indicator = GlobalText.TEXTS;

  @ViewChild('chart') chartDiv;

  @ViewChildren(ButtonFilterComponent) buttonFilters: QueryList<ButtonFilterComponent>;

  public type = "Country";
  public filters: Map<string, FilterInterface> = new Map<string, FilterInterface>();
  public body: any = [];
  public indicators: any[] = [];
  public filtersButton;
  public frequency = this.indicator.report_frequency_year;
  public frequencyChanged = false;
  public chartDimensions: number[];
  public indicatorsLoading = false;
  public period: boolean = false;
  public selectPeriodDisplay;
  public display:boolean = true;

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
    { level: '1', label: this.indicator.report_filter_per_year.toLocaleUpperCase(), value: 'year', active: true },
    { level: '1', label: this.indicator.report_filter_per_quarter.toLocaleUpperCase(), value: 'quarter', active: false },
    { level: '1', label: this.indicator.report_filter_per_month.toUpperCase(), value: 'month', active: false },
  ]

  public dataFilter2: Array<ButtonFilterData> = [
    { level: '0', icon: 'settings/api', color: 'red', label: this.indicator.report_country_report.toLocaleUpperCase(), value: 'Country', active: true },
    { level: '0', icon: 'reporting/projects', color: 'green', label: this.indicator.report_project_report.toLocaleUpperCase(), value: 'Project', active: false },
    { level: '0', icon: 'reporting/distribution', color: 'red', label: this.indicator.report_distribution_report.toLocaleUpperCase(), value: 'Distribution', active: false },
  ]

  //variable for display name of project and distribution in selectors
  public projectList: string[] = [];
  public distributionList: string[] = [];
  
  //array to know which project or distribution are selected 
  public selectedProject: string[] = [];
  public selectedDistribution: string[] = [];

  constructor(
    public indicatorService: IndicatorService,
    public cacheService: CacheService,
    public chartRegistrationService: ChartRegistration,
    public projectService: ProjectService,
    public distribtutionService: DistributionService
  ) {
  }

  ngOnInit() {
    this.checkSize();
    this.getProjects();

    if (!this.indicatorsLoading) {
      this.indicatorsLoading = true;
      this.indicatorService.getIndicators().toPromise().then(response => {

        let indicatorResponse = Indicator.FormatArray(response.json());
        for (let i = 0; i < indicatorResponse.length; i++) {
          this.indicators.push(indicatorResponse[i]);
        }
        this.indicatorsLoading = false
      }).catch(e => {
        this.indicatorsLoading = false;
      });
    }
  }

  ngAfterViewInit() {
    if (this.chartDiv) {
      this.chartDimensions = [400, 300];
    }
    //Get button reference in the template and store it in variable
    this.filtersButton = this.buttonFilters;
  }

  /**
   	* check if the langage has changed
   	*/
  ngDoCheck() {
    if (this.indicator != GlobalText.TEXTS) {
      this.indicator = GlobalText.TEXTS;
      if (this.period) {
        this.frequency = this.indicator.report_period_selected;
      }
      if (!this.frequencyChanged) {
        this.frequency = this.indicator.report_frequency_year;
      }
      this.updateFiltersWithLanguage();
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
    this.dataFilter2.forEach(filter => {
      if (filter['active']) {
        this.type = filter['value'];
        this.selectedProject = [];
        if (this.type == 'Distribution') {
          this.display = false;
        }  else {
          this.display = true;
        }       
      }

    });

    //Verify the frequency selected
    this.dataFilter1.forEach(filter => {
      if (filter['active']) {
        this.frequency = filter['value'];
        this.period = false;
      }
      this.frequencyChanged = true;
    });


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


  /**
   * For the button "choose period", 
   * Allow to now when the button is active or not
   */
  selectPeriod(): void {
    this.period = !this.period;
    if (this.period) {
      this.frequency = this.indicator.report_period_selected;
      this.dataFilter1.forEach(filter => {
        if (filter['active']) {
          filter['active'] = false;

        }
      });
    }
  }

  updateFiltersWithLanguage() {
    this.dataFilter1[0].label = this.indicator.report_filter_per_year.toLocaleUpperCase();
    this.dataFilter1[1].label = this.indicator.report_filter_per_quarter.toLocaleUpperCase();
    this.dataFilter1[2].label = this.indicator.report_filter_per_month.toLocaleUpperCase();

    this.dataFilter2[0].label = this.indicator.report_country_report.toLocaleUpperCase();
    this.dataFilter2[1].label = this.indicator.report_project_report.toLocaleUpperCase();
    this.dataFilter2[2].label = this.indicator.report_distribution_report.toLocaleUpperCase();
  }

  /**
   * Get list of all project and put it in the project selector
   */
  getProjects() {
    this.projectService.get().subscribe(response => {
      let Projectresponse = Project.formatArray(response.json());
      Projectresponse.forEach(element => {
        var concat = element.id + " - " + element.name;
        this.projectList.push(concat);
      });
    });

  }

  /**
   * Get list of all distribution and put it in the distribution selector
   */
  getDistributions() {
    this.distributionList = [];
    this.distribtutionService.getByProject(this.selectedProject[0]).subscribe(response => {
      let distributionResponse = DistributionData.formatArray(response.json());
      distributionResponse.forEach(element => {
        var concat = element.id + " - " + element.name;
        this.distributionList.push(concat);
      });
    });


  }

  /**
    * Get the project selected in the projectList selector
    * @param event 
    */
  getProjectSelected(event) {
    var project = event.value.split(" - ");
    if (this.type === 'Distribution') {
      this.selectedProject = [];
      this.selectedProject.push(project[0]);
      this.getDistributions();   
      this.display = true;
    }

    if (this.type === 'Project') {
      this.selectedProject = [];
      this.selectedProject.push(project[0]);
    }
    
    // if (this.type === 'Project') {
      // let projectfind = false;
      // for (let i=0; i<this.selectedProject.length; i++) {
      //   if (this.selectedProject[i] === project[0]) {
      //     this.selectedProject.splice(this.selectedProject[i].indexOf(project[0]), 1);
      //     projectfind = true;
      //   }
      // }
      // if (!projectfind) {
        // this.selectedProject.push(project[0]);
      // } 

      
      // if(event.isUserInput) {
        // var project = event.source.value.split(" - ");
        // if(event.source.selected) {
        //   this.selectedProject.push(project[0]);
        // }
        // else {
        //   for (let i=0; i<this.selectedProject.length; i++) {
        //     if (this.selectedProject[i] === project[0]) {
        //       this.selectedProject.splice(this.selectedProject[i].indexOf(project[0]), 1);
        //     }
        //   }
        // }        
      // }
    // }
    console.log("select", project[0], this.selectedProject);
  }
}
