import { GraphPeriods } from './graph-value.model';
import { GraphDTO } from './graph.dto';

export class Graph  {
    type: string;
    name: string;
    values: GraphPeriods;

    constructor (graphDTO: GraphDTO) {
        this.name = graphDTO.name;
        this.type = graphDTO.graphType;
        this.values = new GraphPeriods(graphDTO.values);
        // console.log(graphDTO)
        // this.type = graphDTO.graphType;
        // this.name = graphDTO.name;
        // this.values = Object.keys(graphDTO.values).map((key: string) => {
        //     return new GraphValue(graphDTO[key]);
        // });
    }
}

