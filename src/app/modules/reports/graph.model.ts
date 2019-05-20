import { GraphValue } from './graph-value.model';
import { GraphDTO, GraphValueDTO } from './graph.dto';

export class Graph  {
    type: string;
    name: string;
    values: Array<GraphValue>;

    constructor (graphDTO: GraphDTO) {
        this.type = graphDTO.graphType;
        this.name = graphDTO.name;
        this.values = graphDTO.values.map((graphValueDTO: GraphValueDTO) => {
            return new GraphValue(graphValueDTO);
        });
    }
}

