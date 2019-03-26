import { CustomModelField } from './custom-model-field';

export class MultipleObjectsModelField<CustomModel> extends CustomModelField<CustomModel[]> {
    kindOfField = 'MultipleObject';
    value: Array<CustomModel>;
}
