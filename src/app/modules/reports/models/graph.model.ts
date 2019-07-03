import { GraphPeriods } from '../graph-value.model';
import { GraphDTO } from './graph.dto';

export class Graph  {
    type: string;
    name: string;
    values: GraphPeriods;

    constructor (graphDTO: GraphDTO) {
        this.name = graphDTO.name;
        this.type = graphDTO.graphType;
        this.values = new GraphPeriods(graphDTO.values);
    }
}
