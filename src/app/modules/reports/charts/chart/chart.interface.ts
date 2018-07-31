
export interface ChartInterface {
    uniqId:                 string;
    data:                   any;
    view:                   any; //array of dimensions
    scheme:                 ChartSchemeClass;
    title?:                 ChartTitleClass;
    axis?:                  ChartAxisClass;
    legend?:                ChartLegendClass;
    modalConfig?:           ChartModalConfigClass;
    indicatorConfig?:       ChartIndicatorConfigClass;
}

export class ChartAxisClass {
    public showXAxis:      boolean = true;
    public showYAxis:      boolean = true;
    public showXAxisLabel: boolean = true;
    public showYAxisLabel: boolean = true;
    public xAxisLabel:     string = 'X Label';
    public yAxisLabel:     string = 'Y Label';

    constructor(){}
}

export class ChartLegendClass {
    public show:           boolean = false; // has legend or not

    constructor(){}
}

export class ChartSchemeClass{
    public gradient:       boolean = false;
    public domain:         any = [];

    constructor(){}
}

export class ChartTitleClass {
    public main:           string = 'Chart title';
    public sub:            string = 'Chart subtitle';

    constructor(){}
}

export class ChartModalConfigClass {
  public modalId:         string = 'id';

  constructor(){}
}

export class ChartIndicatorConfigClass {
  public idIndicator:     string;
  public type:            string = 'bar';
  public computedMethod:  string = 'computed method';
  public items:           string = '';

  constructor(){}
}
