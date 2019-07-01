export interface GraphDTO {
    graphType: string;
    name: string;
    values: GraphPeriodsDTO;
}

export interface GraphPeriodsDTO {
    [period: string]: Array<GraphValueDTO>;
}
export interface GraphValueDTO {
    date: string;
    name: string;
    unity: string;
    value: string;
}
