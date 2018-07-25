import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, KeyValueDiffers, ViewChild, ElementRef } from '@angular/core';
import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartInterface, ChartSchemeClass, ChartTitleClass, ChartAxisClass, ChartLegendClass, ChartModalConfigClass, ChartIndicatorConfigClass } from './chart.interface';
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

  public body = {};

  uniqId: string;

  // IMPLEMENTS ChartInterface
  @Input() public data: any = [];

  @Input() view: number[];

  @Input() header = false;

  scheme: ChartSchemeClass;
  @Input() title: ChartTitleClass;
  @Input() modalConfig: ChartModalConfigClass;
  @Input() axis: ChartAxisClass;
  legend: ChartLegendClass;


  @Input() filters: Array<FilterInterface> = [];
  oldFilters: Array<FilterInterface> = [];

  @Input() indicatorConfig: ChartIndicatorConfigClass;

  @Output() selectedChart = new EventEmitter<string>();

  @Input() menuOpen: boolean = false;
  @Input() public loader: boolean = false;
  public loaded: boolean = false;
  @Input() public noData: boolean = true;

  @Output() user_action = new EventEmitter<string>();
  public action = '';

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
    this.modalConfig = new ChartModalConfigClass();
    this.indicatorConfig = new ChartIndicatorConfigClass();


    this.differ = this.differs.find({}).create();
  }

  ngOnInit() {

    // Visualisation 
    if(this.indicatorConfig.idIndicator == '10' ) {
      this.scheme = {
        gradient: true,
        domain: [
          '#0E1428', '#ff4514'
        ]
      };
      this.legend.show = true;
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

    // Registration
    this.chartRegistrationService.generateId(this);
    this.filters.forEach((filter: FilterInterface) => {
      this.chartRegistrationService.registerFilter(this, filter);
    })

    //Call data from the back
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
          if(this.indicatorConfig.type == 'nombre') {
            let lastDate = this.data[0]['date'].date;
            let newData: any = [];
            this.data.forEach(element => {
              if (element['date'].date > lastDate) {
                lastDate = element['date'].date;
              }
            });
            this.data.forEach(element => {
              if (element['date'].date == lastDate) {
                newData.push(element);
              }
            });
            this.data = newData;
          }

          if(this.indicatorConfig.type == 'courbe') {
            this.axis.yAxisLabel = this.data[0].series[0]['unity'];
          }
        }
      })
    };

  }

  ngOnChanges(changes: SimpleChanges) {
    //Verify if value change and if value for the chart are already compared
    if (changes.filters.currentValue != changes.filters.previousValue && !ChartRegistration.comparaisons.get(this.uniqId)) {

      //Search filter associate with the chart
      ChartRegistration.associations
        .filter((item: RegisteredItem) => item.chartId === this.uniqId)
        .forEach((item: RegisteredItem) => {
          ChartRegistration.comparaisons.set(this.uniqId, true);
          this.body[item.referenceKey] = item.currentValue;
        })


      if (Object.keys(this.body).length > 1) {

        // let promise = this._chartDataLoaderService.load(this.indicatorConfig.idIndicator, this.body);
        // if (promise) {
        //   promise.toPromise().then(data => {
        //     this.data = data;
        //   })
        // }; 
        this.data = [
              {
                "name": "Value1",
                "value": Math.random()*1000
              },
              {
                "name": "Value2",
                "value": Math.random()*1000
              },
              {
                "name": "Value3",
                "value": Math.random()*1000
              }
        ];


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


  // Actions

  actionClicked(e: string) {
    this.action = e;
  }

  closeMenu(e) {
    this.menuOpen = false;
  }

  clearAction(e) {
    this.action = "";
  }
}
