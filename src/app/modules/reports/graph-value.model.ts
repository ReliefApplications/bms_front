import { GraphPeriodsDTO, GraphValueDTO } from './models/graph.dto';

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
export class GraphPeriods {
    [period: string]: Array<GraphValue>;

    constructor(graphPeriodsDTO: GraphPeriodsDTO) {
        if (!graphPeriodsDTO) {
            return null;
        }
        Object.keys(graphPeriodsDTO).forEach((period: string) => {
            this[period] = graphPeriodsDTO[period].map((graphValueDTO: GraphValueDTO) => {
                return new GraphValue(graphValueDTO);
            });
        });
    }
}
