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

    periodGraphInfo: PeriodGraphInfo;

    pieChartDataSets: Array<PieChartDataSet>;

    colors: Array<Color>;

    public pieChartOptions: ChartOptions = {
        responsive: true,
      };

    private static valuesToPercentages (values: Array<number>) {
        const total = values.reduce((previousValue: number, currentValue: number) => {
            return previousValue + currentValue;
        });
        return values.map((value: number) => {
            return (100 * value / total).toFixed(2);
        });
    }

    ngOnInit() {
        this.periodGraphInfo = this.formatValuePerPeriod();

        this.formatPieChartDataSet();

        this.generateColors();
    }

    formatPieChartDataSet() {
        this.pieChartDataSets = Object.keys(this.periodGraphInfo).map((period: string) => {
            const labels: Array<Label> = [];
            const values: Array<number> = [];
            this.periodGraphInfo[period].forEach((graphValue: GraphValue) => {
                labels.push(graphValue.unit);
                values.push(graphValue.value);
            });
            return {labels, values: PieChartComponent.valuesToPercentages(values), period};
        });

    }

    generateColors() {

        this.colors = [{
            backgroundColor: Colorizer.chooseRandomColors(this.pieChartDataSets[0].labels.length)
        }];
    }
}
