import { Component, OnInit, AfterViewInit, ElementRef, KeyValueDiffers  } from '@angular/core';
import { ChartComponent     } from '../chart/chart.component';

import { ChartDataLoaderService           } from '../../services/chart-data-loader.service';
import { CacheService } from '../../../../core/storage/cache.service';
import { ChartRegistration } from '../../services/chart-registration.service';

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent extends ChartComponent {

  public autoScale: boolean = false;
  // public el: ElementRef;

  constructor(
    protected differs: KeyValueDiffers,
    public _cacheService: CacheService,
    protected chartRegistrationService: ChartRegistration,
    protected _chartDataLoaderService: ChartDataLoaderService
  ) {
    super(differs, _cacheService,  chartRegistrationService, _chartDataLoaderService);
    // this.el = el;
    // this.data = [
    // // {
    // //     "name": "Taux",
    // //     "series": [
    // //       {
    // //         "name": "2015",
    // //         "value": 0.5
    // //       },
    // //       {
    // //         "name": "2016",
    // //         "value": 0.57777777777778
    // //       },
    // //       {
    // //         "name": "2017",
    // //         "value": 0.47058823529412
    // //       }
    // //     ]
    // //   }
    // ];
    // this.view                 = [];
    this.legend.show          = true;
    this.scheme.gradient      = false;
    this.scheme.domain          = ['#92CB53', '#20C8C0', '#FC4F1E'];
    this.axis.showXAxis       = true;
    this.axis.showYAxis       = true;
    this.axis.showXAxisLabel  = true;
    this.axis.showYAxisLabel  = true;
    this.axis.xAxisLabel      = 'X Axis';
    this.axis.yAxisLabel      = 'Y Axis';
    this.title.main           = "";
    this.title.sub            =  "";
    this.autoScale            = false;
  }
}
