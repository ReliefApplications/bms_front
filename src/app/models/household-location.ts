import { TextModelField } from './custom-models/text-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { CustomModel } from './custom-models/custom-model';
import { ObjectModelField } from './custom-models/object-model-field';
import { Address } from './address';
import { CampAddress } from './camp-address';

export class HouseholdLocation extends CustomModel {

    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
            }
        ),
        locationGroup: new TextModelField(
            {

            }
        ),
        type: new TextModelField(
            {

            }
        ),
        address: new ObjectModelField<Address>(
            {

            }
        ),
        campAddress: new ObjectModelField<CampAddress>(
            {

            }
        ),
    };

    public static apiToModel(householdLocationFromApi): HouseholdLocation {
        const newHouseholdLocation = new HouseholdLocation();
        newHouseholdLocation.set('id', householdLocationFromApi.id);
        newHouseholdLocation.set('locationGroup', householdLocationFromApi.location_group);
        newHouseholdLocation.set('type', householdLocationFromApi.type);
        newHouseholdLocation.set('address', householdLocationFromApi.address ? Address.apiToModel(householdLocationFromApi.address) : null);
        newHouseholdLocation.set('campAddress', householdLocationFromApi.camp_address ?
            CampAddress.apiToModel(householdLocationFromApi.camp_address) : null);

        return newHouseholdLocation;
    }

    public modelToApi(): Object {
        return {
            id: this.get('id'),
            location_group: this.get('locationGroup'),
            type: this.get('type'),
            address: this.get('address') ? this.get('address').modelToApi() : null,
            camp_address: this.get('campAddress') ? this.get('campAddress').modelToApi() : null,

        };
    }
}
