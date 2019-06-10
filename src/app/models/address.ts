import { TextModelField } from './custom-models/text-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { CustomModel } from './custom-models/custom-model';
import { ObjectModelField } from './custom-models/object-model-field';
import { Location } from './location';

export class Address extends CustomModel {

    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
            }
        ),
        number: new TextModelField(
            {

            }
        ),
        street: new TextModelField(
            {

            }
        ),
        postcode: new TextModelField(
            {

            }
        ),
        location: new ObjectModelField<Location> (
            {

            }
        ),
    };

    public static apiToModel(addressFromApi): Address {
        const newAddress = new Address();
        newAddress.set('id', addressFromApi.id);
        newAddress.set('number', addressFromApi.number);
        newAddress.set('street', addressFromApi.street);
        newAddress.set('postcode', addressFromApi.postcode);
        newAddress.set('location', Location.apiToModel(addressFromApi.location));

        return newAddress;
    }

    public modelToApi(): Object {
        return {
            id: this.get('id'),
            number: this.get('number'),
            street: this.get('street'),
            postcode: this.get('postcode'),
            location: this.get('location').modelToApi(),

        };
    }
}
