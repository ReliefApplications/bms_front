import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { Color, Label } from 'ng2-charts';
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
        this.dataSet = {
            label: this.graphInfo.name,
            data: []
        };
        this.xAxisLabels = [];

        // Object.values does not type correctly. Using Object.keys is the safe option here
        Object.keys(this.graphInfo.values).forEach((period: string) => {
            // Casting is necessary due to a type error otherwise
            (this.dataSet.data as (number | ChartPoint)[]).push(this.graphInfo.values[period][0].value);
            this.xAxisLabels.push(this.graphInfo.values[period][0].date);
        });
    }
}
