import { TextModelField } from './custom-models/text-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { CustomModel } from './custom-models/custom-model';
import { ObjectModelField } from './custom-models/object-model-field';
import { Camp } from './camp';

export class CampAddress extends CustomModel {

    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
            }
        ),
        tentNumber: new TextModelField(
            {

            }
        ),
        camp: new ObjectModelField<Camp> (
            {

            }
        ),
    };

    public static apiToModel(campAddressFromApi): CampAddress {
        const newCampAddress = new CampAddress();
        newCampAddress.set('id', campAddressFromApi.id);
        newCampAddress.set('tentNumber', campAddressFromApi.tent_number);
        newCampAddress.set('camp', Camp.apiToModel(campAddressFromApi.camp));

        return newCampAddress;
    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            tent_number: this.fields.tentNumber.formatForApi(),
            camp: this.fields.camp.formatForApi(),

        };
    }
}
