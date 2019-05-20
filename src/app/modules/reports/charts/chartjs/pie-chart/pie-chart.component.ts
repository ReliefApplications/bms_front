import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Colorizer } from '../../../colors';
import { GraphValue } from '../../../graph-value.model';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { PeriodGraphInfo, PieChartDataSet } from './pie-chart-dataset';

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: [ './pie-chart.component.scss' ]
})
export class PieChartComponent extends BaseChartComponent implements OnInit {

    periodGraphInfo: PeriodGraphInfo = {};

    pieChartDataSets: Array<PieChartDataSet>;

    colors: Array<Color>;

    public pieChartOptions: ChartOptions = {
        responsive: true,
      };

    ngOnInit() {
        this.formatValuePerPeriod();

        this.formatPieChartDataSet();

        this.generateColors();
    }

    // Pie charts are not time-based graphs, split the different data per periods
    formatValuePerPeriod() {
        const periods: Array<string> = [];
        this.graphInfo.values.forEach((graphValue: GraphValue) => {
            if (!periods.includes(graphValue.date)) {
                periods.push(graphValue.date);
            }
        });

        periods.forEach((period: string) => {
            const periodCharts = this.graphInfo.values.filter((value: GraphValue) => {
                if (value.date === period) {
                    return value;
                }
            });
            this.periodGraphInfo[period] = periodCharts;
        });
    }

    formatPieChartDataSet() {
        console.log(this.periodGraphInfo);
        this.pieChartDataSets = Object.keys(this.periodGraphInfo).map((period: string) => {
            const labels: Array<Label> = [];
            const values: Array<number> = [];
            this.periodGraphInfo[period].forEach((graphValue: GraphValue) => {
                labels.push(graphValue.unit);
                values.push(graphValue.value);
            });
            return {labels, values, period};
        });

        console.log(this.pieChartDataSets);
    }

    generateColors() {

        this.colors = [{
            backgroundColor: Colorizer.chooseRandomColors(this.pieChartDataSets[0].labels.length)
        }];
    }
}
