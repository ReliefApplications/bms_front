export interface ChartInterface {
    uniqId: string;
    data: any;
    view: any; // array of dimensions
    scheme: ChartSchemeClass;
    title?: ChartTitleClass;
    axis?: ChartAxisClass;
    legend?: ChartLegendClass;
    indicatorConfig?: ChartIndicatorConfigClass;
}

export class ChartAxisClass {
    public showXAxis = true;
    public showYAxis = true;
    public showXAxisLabel = true;
    public showYAxisLabel = true;
    public xAxisLabel = 'X Label';
    public yAxisLabel = 'Y Label';

    constructor() { }
}

export class ChartLegendClass {
    public show = false; // has legend or not

    constructor() { }
}

export class ChartSchemeClass {
    public gradient = false;
    public domain: any = [];

    constructor() { }
}

export class ChartTitleClass {
    public main = 'Chart title';
    public sub = 'Chart subtitle';

    constructor() { }
}

export class ChartIndicatorConfigClass {
    public idIndicator: string;
    public type = 'bar';
    public items = '';
    public name = '';

    constructor() { }
}
