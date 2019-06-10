import { TextModelField } from './custom-models/text-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { CustomModel } from './custom-models/custom-model';
import { ObjectModelField } from './custom-models/object-model-field';
import { Location } from './location';

export class Camp extends CustomModel {

    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
            }
        ),
        name: new TextModelField(
            {

            }
        ),
        location: new ObjectModelField<Location> (
            {

            }
        ),
    };

    public static apiToModel(camp): Camp {
        const newCamp = new Camp();
        newCamp.set('id', camp.id);
        newCamp.set('name', camp.name);
        newCamp.set('location', camp.location ? Location.apiToModel(camp.location) : null);

        return newCamp;
    }

    public modelToApi(): Object {
        return {
            id: this.get('id'),
            name: this.get('name'),
            location: this.get('location').modelToApi(),

        };
    }
}
