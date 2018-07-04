import { Component, OnInit, ViewChild, SimpleChanges, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { IndicatorService } from '../services/indicator.service';
import { FilterEvent, FilterInterface, AbstractFilter } from '../model/filter';
import { Indicator } from '../model/indicator';
import { CacheService } from '../../../core/storage/cache.service';
import { ButtonFilterData, ButtonFilterComponent } from '../filters/button-filter/button-filter.component';
import { ChartRegistration, RegisteredItem } from '../services/chart-registration.service';
import { forEach } from '@angular/router/src/utils/collection';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-indicator-page',
  templateUrl: './indicator-page.component.html',
  styleUrls: ['./indicator-page.component.scss']
})
export class IndicatorPageComponent implements OnInit {

  @ViewChild('chart') chartDiv;

  @ViewChildren(ButtonFilterComponent) buttonFilters: QueryList<ButtonFilterComponent>;

  public type = "Country";
  public filters: Map<string, FilterInterface> = new Map<string, FilterInterface>();
  public body: any = [];
  public indicators: any[] = [];
  public filtersButton;
  public frequency = "year";
  public chartDimensions: number[];
  public indicatorsLoading = false;
  public period: boolean = false;
  public selectPeriodDisplay;

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
    { level: '1', label: 'PER YEAR', value: 'year', active: true },
    { level: '1', label: 'PER QUARTER', value: 'quarter', active: false },
    { level: '1', label: 'PER MONTH', value: 'month', active: false },
  ]

  public dataFilter2: Array<ButtonFilterData> = [
    { level: '0', icon: 'settings/api', color: 'red', label: 'COUNTRY REPORT', value: 'country', active: true },
    { level: '0', icon: 'reporting/Projects', color: 'green', label: 'PROJECT REPORT', value: 'project', active: false },
    { level: '0', icon: 'reporting/Distribution', color: 'red', label: 'DISTRIBUTION REPORT', value: 'distribution', active: false },
  ]

  //static variable
  // TODO: Replace par data from back
  projects = new FormControl();
  projectList: string[] = ['a', 'b', 'c', 'd', 'e', 'f'];

  distributions = new FormControl();
  distributionList: string[] = ['0', '1', '2', '3', '4', '5'];

  constructor(
    public referedClassService: IndicatorService,
    public cacheService: CacheService,
    public chartRegistrationService: ChartRegistration
  ) {
  }

  ngOnInit() {
    this.checkSize();
    if (!this.indicatorsLoading) {
      this.indicatorsLoading = true;
        this.referedClassService.getIndicators().toPromise().then(response => {
        this.indicators = response as any;
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
        console.log(this.type);
      }

    });

    //Verify the frequency selected
      this.dataFilter1.forEach(filter => {
        if (filter['active']) {
          this.frequency = filter['value'];
          this.period = false;
        }
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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void{
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  selectPeriod(): void{
    this.period = !this.period;
    if (this.period) {
      this.frequency = "Period selected";
      this.dataFilter1.forEach(filter => {
        if (filter['active']) {
          filter['active'] = false;
          
        }
      });
    }
  }

}
