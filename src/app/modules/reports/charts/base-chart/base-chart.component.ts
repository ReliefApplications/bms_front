import { TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Graph } from '../../dto/graph.model';
import { ColorsService } from '../../services/colors.service';

@Component({
    selector: 'app-base-chart',
    templateUrl: './base-chart.component.html',
    styleUrls: [ './base-chart.component.scss' ]
})
export class BaseChartComponent {

    protected options: ChartOptions;

    constructor(
        protected colorsService: ColorsService,
        private titlecasePipe: TitleCasePipe,
    ) {}

    @Input() graphInfo: Graph;

    protected generateLabels() {
        this.options = {
            ...this.options,
            scales: {
                xAxes: [ {
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    }
                } ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: this.titlecasePipe.transform(Object.values(this.graphInfo.values)[0][0].unit),
                        }
                    },
                ]
            },
        };
        console.log(this.options)
    }
}
