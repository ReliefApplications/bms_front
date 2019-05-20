export interface GraphDTO {
    graphType: string;
    name: string;
    values: Array<GraphValueDTO>;
}

export interface GraphValueDTO {
    date: string;
    name: string;
    unity: string;
    value: string;
}
