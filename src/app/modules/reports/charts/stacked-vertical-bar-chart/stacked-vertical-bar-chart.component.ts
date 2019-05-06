import { Component, KeyValueDiffers } from '@angular/core';
import { LanguageService } from 'src/app/core/language/language.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartRegistration } from '../../services/chart-registration.service';
import { ChartComponent } from '../chart/chart.component';


@Component({
    selector: 'app-stacked-vertical-bar-chart',
    templateUrl: './stacked-vertical-bar-chart.component.html',
    styleUrls: ['./stacked-vertical-bar-chart.component.scss']
})
export class StackedVerticalBarChartComponent extends ChartComponent {

    constructor(
        protected differs: KeyValueDiffers,
        public _cacheService: AsyncacheService,
        protected chartRegistrationService: ChartRegistration,
        protected _chartDataLoaderService: ChartDataLoaderService,
        protected languageService: LanguageService,
    ) {
        super(differs, _cacheService, chartRegistrationService, languageService, _chartDataLoaderService);

    }
}
