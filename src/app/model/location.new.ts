
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';

export class Location {

    title = 'Location';

    fields = {
        id: new NumberModelField(
            {

            }
        ),
        adm1: new SingleSelectModelField(
            {

            }
        ),
        adm2: new SingleSelectModelField(
            {

            }
        ),
        adm3: new SingleSelectModelField(
            {

            }
        ),
        adm4: new SingleSelectModelField(
            {

            }
        ),
        countryIso3: new TextModelField(
            {

            }
        ),
    };

    public static apiToModel(locationFromApi: any): Location {
        const newLocation = new Location();
        newLocation.fields.id.value = locationFromApi.id;
        newLocation.fields.adm1.value.fields.id = locationFromApi.adm1 ? locationFromApi.adm1.id : null;
        newLocation.fields.adm1.value.fields.name = locationFromApi.adm1 ? locationFromApi.adm1.name : null;
        newLocation.fields.adm2.value.fields.id = locationFromApi.adm2 ? locationFromApi.adm2.id : null;
        newLocation.fields.adm2.value.fields.name = locationFromApi.adm2 ? locationFromApi.adm2.name : null;
        newLocation.fields.adm3.value.fields.id = locationFromApi.adm3 ? locationFromApi.adm3.id : null;
        newLocation.fields.adm3.value.fields.name = locationFromApi.adm3 ? locationFromApi.adm3.name : null;
        newLocation.fields.adm4.value.fields.id = locationFromApi.adm4 ? locationFromApi.adm4.id : null;
        newLocation.fields.adm4.value.fields.name = locationFromApi.adm4 ? locationFromApi.adm4.name : null;

        return newLocation;
    }


    getLocationName(): string {
        let name =  this.fields.adm1 ? this.fields.adm1.value.fields.name.value : '';
        name += this.fields.adm2 ? this.fields.adm2.value.fields.name.value : '';
        name += this.fields.adm3 ? this.fields.adm3.value.fields.name.value : '';
        name += this.fields.adm4 ? this.fields.adm4.value.fields.name.value : '';
        return name;

    }

}
