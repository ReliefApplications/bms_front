import { Component, OnInit, KeyValueDiffers  } from '@angular/core';
import { ChartComponent     } from '../chart/chart.component';

import { ChartDataLoaderService           } from '../../services/chart-data-loader.service';
import { CacheService } from '../../../../core/storage/cache.service';
import { ChartRegistration } from '../../services/chart-registration.service';

@Component({
  selector: 'number-card-chart',
  templateUrl: './number-card-chart.component.html',
  styleUrls: ['./number-card-chart.component.scss']
})
export class NumberCardChartComponent extends ChartComponent {

  constructor(
    protected differs: KeyValueDiffers,
    public _cacheService: CacheService,
    protected chartRegistrationService: ChartRegistration,
    protected _chartDataLoaderService: ChartDataLoaderService
  ) {
    super(differs, _cacheService, chartRegistrationService, _chartDataLoaderService);
  }

  ngOnInit() {
    super.ngOnInit();
  }
}
