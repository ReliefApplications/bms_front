import { Component, OnInit, KeyValueDiffers } from '@angular/core';
import { ChartComponent } from '../chart/chart.component';

import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartRegistration } from '../../services/chart-registration.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

@Component({
  selector: 'stacked-vertical-bar-chart',
  templateUrl: './stacked-vertical-bar-chart.component.html',
  styleUrls: ['./stacked-vertical-bar-chart.component.scss']
})
export class StackedVerticalBarChartComponent extends ChartComponent {

  constructor(
    protected differs: KeyValueDiffers,
    public _cacheService: AsyncacheService,
    protected chartRegistrationService: ChartRegistration,
    protected _chartDataLoaderService: ChartDataLoaderService
  ) {
    super(differs, _cacheService, chartRegistrationService, _chartDataLoaderService);

  }
}
