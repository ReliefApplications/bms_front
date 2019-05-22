import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import { GraphValue } from '../../../graph-value.model';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { PeriodGraphInfo } from '../pie-chart/pie-chart-dataset';
import { BarChartDataSet, NestedLabeledValue } from './bar-chart-dataset';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: [ './bar-chart.component.scss' ]
})
export class BarChartComponent extends BaseChartComponent implements OnInit {
    periodGraphInfo: PeriodGraphInfo;
    dataSet: BarChartDataSet = new BarChartDataSet();

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
        this.periodGraphInfo = this.formatValuePerPeriod();

        this.formatBarChartDataSet();
    }

    formatBarChartDataSet() {
        const labels: Array<Label> = [];
        const dataSet: NestedLabeledValue = {};
        Object.keys(this.periodGraphInfo).forEach((period: string) => {
            labels.push(period);
            this.periodGraphInfo[period].forEach((graphValue: GraphValue) => {
                const dataSetEntryKey = graphValue.name;
                if (!dataSet[dataSetEntryKey]) {
                    dataSet[dataSetEntryKey] = [];
                }
                dataSet[dataSetEntryKey].push(graphValue.value);
            });
        });
        console.log(this.dataSet);
        console.log(dataSet);
        Object.entries(dataSet).forEach((value: [string, Array<number>]) => {
            this.dataSet.values.push({
                label: value[0],
                data: value[1]
            });
        });
        this.dataSet.labels = labels;
        console.log(this.dataSet);
    }
}
