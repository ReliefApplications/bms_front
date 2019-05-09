import { Component, KeyValueDiffers } from '@angular/core';
import { LanguageService } from 'src/app/core/language/language.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartRegistration } from '../../services/chart-registration.service';
import { ChartComponent } from '../chart/chart.component';


@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent extends ChartComponent {

    public autoScale = false;
    public yAxisTickFormattingFn = this.yAxisTickFormatting.bind(this);

    constructor(
        protected differs: KeyValueDiffers,
        public _cacheService: AsyncacheService,
        protected chartRegistrationService: ChartRegistration,
        protected _chartDataLoaderService: ChartDataLoaderService,
        protected languageService: LanguageService,
    ) {
        super(differs, _cacheService, chartRegistrationService, languageService, _chartDataLoaderService);
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
        this.autoScale = false;
    }

    yAxisTickFormatting(value) {
        return typeof(value) === 'number' && value % 1 !== 0 ? '' : value;
    }
}
