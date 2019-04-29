import { CustomModel } from './CustomModel/custom-model';
import { TextModelField } from './CustomModel/text-model-field';

export class Country extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({}),
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id).set('name', name);
    }
}
