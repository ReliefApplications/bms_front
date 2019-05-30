import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color as GraphColor, Label } from 'ng2-charts';
import { Colorizer } from '../../../colors';
import { GraphValue } from '../../../graph-value.model';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { NestedLabeledValue } from './bar-chart-dataset';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: [ './bar-chart.component.scss' ]
})
export class BarChartComponent extends BaseChartComponent implements OnInit {
    // periodGraphInfo: PeriodGraphInfo;

    public periods: Array<Label>;

    public barChartDataSet: Array<ChartDataSets>;

    colors: Array<GraphColor>;

    public options: ChartOptions = {
        responsive: true,
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    };

    ngOnInit() {
        this.generatePeriods();
        this.formatBarChartDataSet();
        this.generateColors();
    }

    private generatePeriods() {
        this.periods = Object.keys(this.graphInfo.values);
    }

    private formatBarChartDataSet() {
        const dataSets: NestedLabeledValue = {};

        // 0 padding for data starting only after the first period
        const periodValuePadding: Array<number> = [];
        this.periods.forEach((period: string) => {
            this.graphInfo.values[period].forEach((graphValue: GraphValue) => {

                const dataSetKey: string = graphValue.name;
                if (! dataSets[dataSetKey]) {
                    dataSets[dataSetKey] = [
                        ...periodValuePadding,
                    ];
                }

                dataSets[dataSetKey].push(graphValue.value);
            });
            periodValuePadding.push(0);
        });

        this.barChartDataSet = [];

        Object.entries(dataSets).forEach((value: [string, Array<number>]) => {
            this.barChartDataSet.push({
                label: value[0],
                data: value[1],
            });
        });
    }

    private generateColors() {
        this.colors = Colorizer.generateColorSets(this.barChartDataSet.length);
    }
}
