import { CustomModelField } from './custom-model-field';

export class ObjectModelField<CustomModel> extends CustomModelField<CustomModel> {
    kindOfField = 'Object';
    value: CustomModel;
}
