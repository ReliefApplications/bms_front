import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

export interface NestedLabeledValue {
    [label: string]: Array<number>;
}

export class BarChartDataSet {
    labels: Array<Label> = [];
    values: Array<ChartDataSets> = [];
}

