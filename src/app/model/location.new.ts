
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { GlobalText } from 'src/texts/global';

export class Location {

    title = 'Location';

    fields = {
        id: new NumberModelField(
            {

            }
        ),
        adm1: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.adm1
            }
        ),
        adm2: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.adm2
            }
        ),
        adm3: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.adm3
            }
        ),
        adm4: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.adm4
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

        let adm1;
        let adm2;
        let adm3;
        let adm4;

        if (locationFromApi.adm4) {
            adm4 = locationFromApi.adm4;
            adm3 = locationFromApi.adm4.adm3;
            adm2 = locationFromApi.adm4.adm3.adm2;
            adm1 = locationFromApi.adm4.adm3.adm2.adm1;
        } else if (locationFromApi.adm3) {
            adm4 = null;
            adm3 = locationFromApi.adm3;
            adm2 = locationFromApi.adm3.adm2;
            adm1 = locationFromApi.adm3.adm2.adm1;
        } else if (locationFromApi.adm2) {
            adm4 = null;
            adm3 = null;
            adm2 = locationFromApi.adm2;
            adm1 = locationFromApi.adm2.adm1;
        } else if (locationFromApi.adm1) {
            adm4 = null;
            adm3 = null;
            adm2 = null;
            adm1 = locationFromApi.adm1;
        }


        newLocation.fields.adm1.value = { fields : {
            name: { value: adm1 ? adm1.name : null },
            id: { value: adm1 ? adm1.id : null }
        }};
        newLocation.fields.adm2.value = { fields : {
            name: { value: adm2 ? adm2.name : null },
            id: { value: adm2 ? adm2.id : null }
        }};
        newLocation.fields.adm3.value = { fields : {
            name: { value: adm3 ? adm3.name : null },
            id: { value: adm3 ? adm3.id : null }
        }};
        newLocation.fields.adm4.value = { fields : {
            name: { value: adm4 ? adm4.name : null },
            id: { value: adm4 ? adm4.id : null }
        }};
        return newLocation;
    }


    getLocationName(): string {
        let name =  this.fields.adm1 && this.fields.adm1.value.fields.name.value ? this.fields.adm1.value.fields.name.value : '';
        name += this.fields.adm2 && this.fields.adm2.value.fields.name.value ? ' ' + this.fields.adm2.value.fields.name.value : '';
        name += this.fields.adm3 && this.fields.adm3.value.fields.name.value ? ' ' + this.fields.adm3.value.fields.name.value : '';
        name += this.fields.adm4 && this.fields.adm4.value.fields.name.value ? ' ' + this.fields.adm4.value.fields.name.value : '';
        return name;

    }

    public modelToApi(): Object {
        return {
            adm1: this.fields.adm1.value ? this.fields.adm1.value.fields.name.value : null,
            adm2: this.fields.adm2.value ? this.fields.adm2.value.fields.name.value : null,
            adm3: this.fields.adm3.value ? this.fields.adm3.value.fields.name.value : null,
            adm4: this.fields.adm4.value ? this.fields.adm4.value.fields.name.value : null,

        };
    }

    public getIdentifyingName() {
        return this.getLocationName();
    }

}
