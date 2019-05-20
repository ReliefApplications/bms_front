import { GraphValueDTO } from './graph.dto';

export class GraphValue {
    date: string;
    name: string;
    unit: string;
    value: number;

    constructor (graphValueDTO: GraphValueDTO) {
        this.date = graphValueDTO.date;
        this.name = graphValueDTO.name;
        this.unit = graphValueDTO.unity;
        this.value = Number(graphValueDTO.value);
    }
}
