import { Component, Input } from '@angular/core';
import { GraphValue } from '../../../graph-value.model';
import { Graph } from '../../../graph.model';
import { PeriodGraphInfo } from '../pie-chart/pie-chart-dataset';

@Component({
    selector: 'app-base-chart',
    templateUrl: './base-chart.component.html',
    styleUrls: [ './base-chart.component.scss' ]
})
export class BaseChartComponent {
    @Input() graphInfo: Graph;

    // Pie charts are not time-based graphs, split the different data per periods
    protected formatValuePerPeriod() {
        const periods: Array<string> = [];
        this.graphInfo.values.forEach((graphValue: GraphValue) => {
            if (!periods.includes(graphValue.date)) {
                periods.push(graphValue.date);
            }
        });
        const periodGraphInfo: PeriodGraphInfo = {};
        periods.forEach((period: string) => {
            const periodCharts = this.graphInfo.values.filter((value: GraphValue) => {
                if (value.date === period) {
                    return value;
                }
            });
            periodGraphInfo[period] = periodCharts;
        });
        return periodGraphInfo;
    }

}
