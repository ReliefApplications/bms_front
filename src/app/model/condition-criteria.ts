import { CustomModel } from './CustomModel/custom-model';
import { TextModelField } from './CustomModel/text-model-field';

export class ConditionCriteria extends CustomModel {

    public fields = {
        name: new TextModelField ({

        })
    };

    public getIdentifyingName() {
        return this.fields.name.value;
    }
}
