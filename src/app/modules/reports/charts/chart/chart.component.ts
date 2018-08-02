import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, KeyValueDiffers, ViewChild, ElementRef } from '@angular/core';
import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartInterface, ChartSchemeClass, ChartTitleClass, ChartAxisClass, ChartLegendClass, ChartIndicatorConfigClass } from './chart.interface';
import { FilterInterface } from '../../../../model/filter';
import { CacheService } from '../../../../core/storage/cache.service';
import { timeout } from 'q';
import { FilterService } from '../../services/filter.service';
import { ChartRegistration, RegisteredItem } from '../../services/chart-registration.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit, ChartInterface {

  differ: any;
  @ViewChild('header') headerRef: ElementRef;

  public body: any = {};

  uniqId: string;

  // IMPLEMENTS ChartInterface
  @Input() public data: any = [];

  @Input() view: number[];

  @Input() header = false;

  scheme: ChartSchemeClass;
  @Input() title: ChartTitleClass;
  @Input() axis: ChartAxisClass;
  legend: ChartLegendClass;

  @Input() project: string[] = [];
  oldProject: string[] = [];

  @Input() distribution: string[] = [];
  oldDistribution: string[] = [];

  @Input() filters: Array<FilterInterface> = [];
  oldFilters: Array<FilterInterface> = [];

  @Input() periodFrequency: string;
  oldfilterFrequency: string = '';

  @Input() indicatorConfig: ChartIndicatorConfigClass;

  @Output() selectedChart = new EventEmitter<string>();

  @Input() public loader: boolean = false;
  public loaded: boolean = false;
  @Input() public noData: boolean = true;

  constructor(
    protected differs: KeyValueDiffers,
    public _cacheService: CacheService,
    protected chartRegistrationService: ChartRegistration,
    protected _chartDataLoaderService?: ChartDataLoaderService,
  ) {
    this.data = [];
    this.scheme = new ChartSchemeClass();
    this.title = new ChartTitleClass();
    this.axis = new ChartAxisClass();
    this.legend = new ChartLegendClass();
    this.indicatorConfig = new ChartIndicatorConfigClass();


    this.differ = this.differs.find({}).create();
  }

  ngOnInit() {
    // Visualisation 
    if (this.indicatorConfig.name === 'Number Men and Women') {
      this.scheme = {
        gradient: true,
        domain: [
          '#0E1428', '#ff4514'
        ]
      };
    } else {
      this.scheme = {
        gradient: true,
        domain: [
          '#F0A202', '#0E1428', '#ff4514', '#009EAE', '#FF866F', '#772014', '#235789'
        ]
      };
    }

    let header = document.getElementById("header");
    this.view = [360, 300];
    if (header) {
      this.view[0] = header.offsetWidth;
      this.view[1] = 360 - header.offsetHeight;
    }

    // Filters
    this.oldFilters = this.filters;
    this.oldfilterFrequency = 'Month';
    if(this.indicatorConfig.items === "Distribution") {
      this.body["project"] = this.project;
      this.oldProject = this.project;
    } else {
      this.body['NoProject'] = [];
    }
    this.body['NoDistribution'] = [];

    // Registration
    this.chartRegistrationService.generateId(this);
    this.filters.forEach((filter: FilterInterface) => {
      this.chartRegistrationService.registerFilter(this, filter);
    })

    this.chartAssociation();
    //Call data from the back
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges) {
    //Verify if value change and if value for the chart are already compared
    if ((changes.filters.currentValue != changes.filters.previousValue && !ChartRegistration.comparaisons.get(this.uniqId)) ||
      (changes.project && changes.project.currentValue != changes.project && changes.project.previousValue) ||
      (changes.distribution && changes.distribution.currentValue != changes.distribution && changes.distribution.previousValue) ||
      (changes.periodFrequency && changes.periodFrequency.currentValue != changes.periodFrequency && changes.periodFrequency.previousValue)) {

      this.chartAssociation();

      if (Object.keys(this.body).length === 3) {
        this.switchFrequencyOrSelector();
      }
      this.loader = false;
      this.loaded = true;
    }
  }

  ngAfterViewChecked() {
    /**
     *Allow a responsive chart
     */
    let header = document.getElementById("header");
    if (header && this.view && ((this.view[0] != header.offsetWidth - 20) || (this.view[1] != 360 - header.offsetHeight))) {
      this.view[0] = header.offsetWidth - 20;
      this.view[1] = 360 - header.offsetHeight;
    }
  }

  /**
   * Get data from the back with id of indicator and body
   * Body contains filters : 
   *  - Project = to know which project the user want to display
   *  - Distribution = to know which distribution the user want to display
   *                           A distribution is always link with a project
   *  - frequency = to knwo which frequency the user want to display
   *  - if no project or distribution are selected, keys Project and Distribution
   *    are replace by keys NoDistribtion and NoProject
   */
  getData() {
    let promise = this._chartDataLoaderService.load(this.indicatorConfig.idIndicator, this.body);
    if (promise) {
      promise.toPromise().then(response => {
        this.data = response.json();
        if (!this.data || this.data.length === 0) {
          this.noData = true;
          this.loader = false;
        }
        else {
          this.noData = false;
          if (this.indicatorConfig.type == 'line') {
            this.axis.yAxisLabel = this.data[0].series[0]['unity'];
          }
        }
      })
    };
  }

  /**
   * To put the good key in the body before get the data
   * If nameCase is frequency : only button filter date was clicked
   * If namecase is default : only selector was touch
   */
  putInBody(nameCase: string) {
    if (nameCase === "frequency") {
      if (this.oldProject.length > 0) {
        this.body['project'] = this.oldProject;
        delete (this.body['NoProject']);
      } else if (this.oldProject.length === 0) {
        delete (this.body['project']);
        this.body['NoProject'] = [];
      }
      if (this.oldDistribution.length > 0) {
        this.body['distribution'] = this.oldDistribution;
        delete (this.body['NoDistribution']);

      } else if (this.oldDistribution.length === 0) {
        delete (this.body['distribution']);
        this.body['NoDistribution'] = [];
      }
    }
    else {
      if ((this.project.length > 0)) {
        this.body['project'] = this.project;
        delete (this.body['NoProject']);
      } else if (this.project.length === 0) {
        delete (this.body['project']);
        this.body['NoProject'] = [];
      }

      if (this.distribution.length > 0) {
        this.body['distribution'] = this.distribution;
        delete (this.body['NoDistribution']);

      } else if (this.distribution.length === 0) {
        delete (this.body['distribution']);
        this.body['NoDistribution'] = [];
      }
    }

  }

  /**
   * Function to know if the user interact with button filter date or selector
   */
  switchFrequencyOrSelector() {
      if(this.oldfilterFrequency !== this.body['frequency']) {
        this.putInBody("frequency");
        if(this.body["frequency"] !== "Period") {
          this.getData();
        }
      } else {
        this.putInBody("default");
        if(this.body["frequency"] !== "Period") {
          this.getData();
        }
        // this.getData();
        this.oldProject = this.project;
        this.oldDistribution = this.distribution;
      }
      this.oldfilterFrequency = this.body['frequency'];
  }

  /**
   * function call when here is an interaction with the date button
   */
  changeFrequency(currentValueFilter: string, referenceKey: string) {
    if (referenceKey === "frequency") {
      if (currentValueFilter === 'Period') {
        this.body['frequency'] = this.periodFrequency;
      }
      else if (currentValueFilter === 'Year' || currentValueFilter === 'Month' || currentValueFilter === 'Quarter') {
        this.body['frequency'] = currentValueFilter;
      }
    }
   
  }

  /**
   * search the filter associate to the charts
   */
  chartAssociation() {
    ChartRegistration.associations
    .filter((item: RegisteredItem) => item.chartId === this.uniqId)
    .forEach((item: RegisteredItem) => {
      ChartRegistration.comparaisons.set(this.uniqId, true);
      this.changeFrequency(item.currentValue, item.referenceKey);
    })
  }
}
