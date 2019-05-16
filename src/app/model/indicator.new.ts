import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';

export class Indicator extends CustomModel {

    fields = {
        id: new NumberModelField({}),
        name: new TextModelField({}),
        graphType: new TextModelField({}),
        reportType: new TextModelField({}),
    };

    public static apiToModel(indicatorFromApi: any): Indicator {
        const newIndicator = new Indicator();

        return newIndicator
            .set('id', indicatorFromApi.id)
            .set('name', indicatorFromApi.full_name)
            .set('graphType', indicatorFromApi.type_graph)
            .set('reportType', indicatorFromApi.type);
    }
}
