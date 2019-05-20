import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { GraphValue } from '../../../graph-value.model';
import { BaseChartComponent } from '../base-chart/base-chart.component';

@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: [ './line-chart.component.scss' ]
})
export class LineChartComponent extends BaseChartComponent implements OnInit {

    dataSet: ChartDataSets;
    xAxisLabels: Label[];

    public lineChartOptions: ChartOptions & { annotation: any } = {
        responsive: true,
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [ {} ],
            yAxes: [
                {
                    id: 'y-axis-0',
                    position: 'left'
                },
            ]
        },
        annotation: {
            annotations: [
                {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: 'March',
                    borderColor: 'orange',
                    borderWidth: 2,
                    label: {
                        enabled: true,
                        fontColor: 'orange',
                        content: 'LineAnno'
                    }
                }
            ]
        }
    };
    public lineChartColors: Color[] = [
        {
            // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
    ];

    ngOnInit() {
        const dataSet = {
            label: this.graphInfo.name,
            data: []
        };
        const xAxisLabels = [];

        this.graphInfo.values.forEach((graphValue: GraphValue) => {
            dataSet.data.push(graphValue.value);
            xAxisLabels.push(graphValue.date);
        });

        this.dataSet = dataSet;
        this.xAxisLabels = xAxisLabels;
    }
}
