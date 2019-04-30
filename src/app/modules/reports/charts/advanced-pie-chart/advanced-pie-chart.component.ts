import { Component, KeyValueDiffers, OnInit } from '@angular/core';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ChartDataLoaderService } from '../../services/chart-data-loader.service';
import { ChartRegistration } from '../../services/chart-registration.service';
import { ChartComponent } from '../chart/chart.component';
import { LanguageService } from './../../../../../texts/language.service';


@Component({
    selector: 'app-advanced-pie-chart',
    templateUrl: './advanced-pie-chart.component.html',
    styleUrls: ['./advanced-pie-chart.component.scss']
})
export class AdvancedPieChartComponent extends ChartComponent implements OnInit {

    constructor(
        protected differs: KeyValueDiffers,
        public _cacheService: AsyncacheService,
        protected chartRegistrationService: ChartRegistration,
        protected _chartDataLoaderService: ChartDataLoaderService,
        protected languageService: LanguageService,
    ) {
        super(differs, _cacheService, chartRegistrationService, languageService, _chartDataLoaderService);
        this.view = [];
        this.legend.show = true;
        this.scheme.gradient = false;
        this.scheme.domain = ['#92CB53', '#20C8C0', '#FC4F1E'];
        this.title.main = '';
        this.title.sub = '';
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
