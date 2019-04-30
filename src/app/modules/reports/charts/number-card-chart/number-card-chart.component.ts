import { Component, KeyValueDiffers, OnInit } from '@angular/core';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartRegistration } from '../../services/chart-registration.service';
import { ChartComponent } from '../chart/chart.component';
import { LanguageService } from './../../../../../texts/language.service';


@Component({
    selector: 'app-number-card-chart',
    templateUrl: './number-card-chart.component.html',
    styleUrls: ['./number-card-chart.component.scss']
})
export class NumberCardChartComponent extends ChartComponent implements OnInit {

    constructor(
        protected differs: KeyValueDiffers,
        public _cacheService: AsyncacheService,
        protected chartRegistrationService: ChartRegistration,
        protected _chartDataLoaderService: ChartDataLoaderService,
        protected languageService: LanguageService,
    ) {
        super(differs, _cacheService, chartRegistrationService, languageService, _chartDataLoaderService);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
