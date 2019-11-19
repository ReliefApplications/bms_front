import { TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Graph } from '../../models/graph.model';
import { ColorsService } from '../../services/colors.service';
import { LanguageService } from 'src/app/core/language/language.service';

@Component({
    selector: 'app-base-chart',
    templateUrl: './base-chart.component.html',
    styleUrls: [ './base-chart.component.scss' ]
})
export class BaseChartComponent {

    protected options: ChartOptions;
    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        protected colorsService: ColorsService,
        private titlecasePipe: TitleCasePipe,
        private languageService: LanguageService
    ) {}

    @Input() graphInfo: Graph;

    protected generateLabels() {
        this.options = {
            ...this.options,
            scales: {
                xAxes: [ {
                    scaleLabel: {
                        display: true,
                        labelString: this.language.report_time
                    }
                } ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: this.titlecasePipe.transform(Object.values(this.graphInfo.values)[0][0].unit),
                        },
                        ticks: {
                            beginAtZero: true,
                        }
                    },
                ]
            },
        };
    }
}
