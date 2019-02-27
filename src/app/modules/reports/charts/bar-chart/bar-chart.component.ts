import { Component, OnInit, ViewChild, SimpleChange, SimpleChanges, KeyValueDiffers } from '@angular/core';
import { ChartComponent } from '../chart/chart.component';

import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartRegistration } from '../../services/chart-registration.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { GlobalText } from '../../../../../texts/global';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent extends ChartComponent {

    public Text = GlobalText.TEXTS;

    constructor(
        protected differs: KeyValueDiffers,
        public _cacheService: AsyncacheService,
        protected chartRegistrationService: ChartRegistration,
        protected _chartDataLoaderService: ChartDataLoaderService
    ) {
        super(differs, _cacheService, chartRegistrationService, _chartDataLoaderService);


        this.legend.show = true;
        this.scheme.gradient = false;
        this.scheme.domain = ['#92CB53', '#20C8C0', '#FC4F1E'];
        this.axis.showXAxis = true;
        this.axis.showYAxis = true;
        this.axis.showXAxisLabel = true;
        this.axis.showYAxisLabel = true;
        this.axis.xAxisLabel = 'X Axis';
        this.axis.yAxisLabel = 'Y Axis';
        this.title.main = '';
        this.title.sub = '';
    }
}
