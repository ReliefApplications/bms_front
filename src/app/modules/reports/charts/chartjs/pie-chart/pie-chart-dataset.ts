import { Label } from 'ng2-charts';
import { GraphValue } from '../../../graph-value.model';

export interface PieChartDataSet {
    period: string;
    labels: Array<Label>;
    values: Array<number|string>;
}

export interface PeriodGraphInfo {
    [period: string]: Array<GraphValue>;
}
