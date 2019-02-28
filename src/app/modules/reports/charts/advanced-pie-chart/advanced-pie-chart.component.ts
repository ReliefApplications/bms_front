import { Component, OnInit, KeyValueDiffers  } from '@angular/core';
import { ChartComponent     } from '../chart/chart.component';

import { ChartDataLoaderService           } from '../../services/chart-data-loader.service';
import { ChartRegistration } from '../../services/chart-registration.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

@Component({
  selector: 'advanced-pie-chart',
  templateUrl: './advanced-pie-chart.component.html',
  styleUrls: ['./advanced-pie-chart.component.scss']
})
export class AdvancedPieChartComponent extends ChartComponent {

  constructor(
    protected differs: KeyValueDiffers,
    public _cacheService: AsyncacheService,
    protected chartRegistrationService: ChartRegistration,
    protected _chartDataLoaderService: ChartDataLoaderService
  ) {
    super(differs, _cacheService, chartRegistrationService, _chartDataLoaderService);

    // this.data = [
    //     {
    //         "name": "Germany",
    //         "value": 8940000
    //     },
    //     {
    //         "name": "USA",
    //         "value": 5000000
    //     },
    //     {
    //         "name": "France",
    //         "value": 7200000
    //     }
    // ];
    this.view                   = [];
    this.legend.show            = true;
    this.scheme.gradient        = false;
    this.scheme.domain          = ['#92CB53', '#20C8C0', '#FC4F1E'];
    this.title.main             = "";
    this.title.sub              =  "";
  }

  ngOnInit() {

    super.ngOnInit();
  }
}
