import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { Color as ChartColor, Label } from 'ng2-charts';
import { BaseChartComponent } from '../base-chart/base-chart.component';

@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: [ './line-chart.component.scss' ]
})

export class LineChartComponent extends BaseChartComponent implements OnInit {

    dataSet: ChartDataSets;
    xAxisLabels: Label[];

    public options: ChartOptions = {
        responsive: true,
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [ {
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }
            } ],
            yAxes: [
                {
                    id: 'y-axis-0',
                    position: 'left'
                },
            ]
        },
    };

    public lineChartColors: ChartColor[];

    ngOnInit() {
        this.dataSet = {
            label: this.graphInfo.name,
            data: []
        };
        this.xAxisLabels = [];

        this.generateDataSet();
        this.generateColors();
        this.generateLabels();
    }

    private generateDataSet(): void {
        // Object.values does not type correctly. Using Object.keys is the safe option here
        Object.keys(this.graphInfo.values).forEach((period: string) => {
            // Casting is necessary due to a type error otherwise
            (this.dataSet.data as (number | ChartPoint)[]).push(this.graphInfo.values[period][0].value);
            this.xAxisLabels.push(this.graphInfo.values[period][0].date);
        });
    }

    private generateColors() {
        const mainColor = this.colorsService.chooseRandomColor();
        this.lineChartColors = [
            {
                borderColor: mainColor.string(),
                backgroundColor: mainColor.lighten(0.1).alpha(0.5).string(),
                pointHoverBackgroundColor: mainColor.darken(0.5).string(),
                hoverBackgroundColor: mainColor.darken(0.3).string(),
                pointBorderColor: mainColor.darken(0.1).string(),
            }
        ];
    }
}
