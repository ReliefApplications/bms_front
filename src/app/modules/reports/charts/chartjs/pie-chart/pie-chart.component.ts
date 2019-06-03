import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Color as ChartColor, Label } from 'ng2-charts';
import { Colorizer } from '../../../colors';
import { GraphValue } from '../../../graph-value.model';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { PieChartDataSet } from './pie-chart-dataset';

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: [ './pie-chart.component.scss' ]
})
export class PieChartComponent extends BaseChartComponent implements OnInit {


    pieChartDataSets: Array<PieChartDataSet>;

    colors: Array<ChartColor>;

    periods: Array<string>;

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

        this.formatPieChartDataSet();
        this.generateColors();
    }

    private formatPieChartDataSet() {
        this.periods = [];
        this.pieChartDataSets = [];

        this.pieChartDataSets = Object.keys(this.graphInfo.values).map((period: string) => {
            this.periods.push(period);
            const labels: Array<Label> = [], values: Array<number> = [];
            this.graphInfo.values[period].map((graphValue: GraphValue) => {
                labels.push(graphValue.unit);
                values.push(graphValue.value);
            });
            return new PieChartDataSet(labels, PieChartComponent.valuesToPercentages(values));
        });
    }

    generateColors() {
        this.colors = [Colorizer.generateColorsSet(this.pieChartDataSets.length)];
    }
}
