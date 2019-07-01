import { Label } from 'ng2-charts';

export class PieChartDataSet {
    labels: Array<Label>;
    values: Array<number|string>;

    constructor(labels: Array<Label>, values: Array<number|string>) {
        this.labels = labels;
        this.values = values;
    }
}
