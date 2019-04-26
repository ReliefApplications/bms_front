
import { CustomModel } from './CustomModel/custom-model';
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';

export class Adm extends CustomModel {

    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}
export class Location extends CustomModel {

    title = 'Location';
    matSortActive = 'adm1';

    fields = {
        id: new NumberModelField(
            {

            }
        ),
        adm1: new SingleSelectModelField(
            {
                title: this.language.adm1,
                bindField: 'name'
            }
        ),
        adm2: new SingleSelectModelField(
            {
                title: this.language.adm2,
                bindField: 'name'
            }
        ),
        adm3: new SingleSelectModelField(
            {
                title: this.language.adm3,
                bindField: 'name'
            }
        ),
        adm4: new SingleSelectModelField(
            {
                title: this.language.adm4,
                bindField: 'name'
            }
        ),
        countryIso3: new TextModelField(
            {

            }
        ),
    };

    public static apiToModel(locationFromApi: any): Location {
        const newLocation = new Location();
        newLocation.set('id', locationFromApi.id);

        let adm1;
        let adm2;
        let adm3;
        let adm4;

        if (locationFromApi.adm4) {
            adm4 = locationFromApi.adm4;
            adm3 = adm4.adm3;
            adm2 = adm3.adm2;
            adm1 = adm2.adm1;
        } else if (locationFromApi.adm3) {
            adm4 = null;
            adm3 = locationFromApi.adm3;
            adm2 = adm3.adm2;
            adm1 = adm2.adm1;
        } else if (locationFromApi.adm2) {
            adm4 = null;
            adm3 = null;
            adm2 = locationFromApi.adm2;
            adm1 = adm2.adm1;
        } else if (locationFromApi.adm1) {
            adm4 = null;
            adm3 = null;
            adm2 = null;
            adm1 = locationFromApi.adm1;
        }

        newLocation.set('adm1', adm1 ? new Adm(adm1.id, adm1.name) : new Adm(null, null));
        newLocation.set('adm2', adm2 ? new Adm(adm2.id, adm2.name) : new Adm(null, null));
        newLocation.set('adm3', adm3 ? new Adm(adm3.id, adm3.name) : new Adm(null, null));
        newLocation.set('adm4', adm4 ? new Adm(adm4.id, adm4.name) : new Adm(null, null));

        return newLocation;
    }


    getLocationName(): string {
        let name =  this.get('adm1') && this.get('adm1').get('name') ? this.get('adm1').get<string>('name') : '';
        name += this.get('adm2') && this.get('adm2').get('name') ? ' ' + this.get('adm2').get<string>('name') : '';
        name += this.get('adm3') && this.get('adm3').get('name') ? ' ' + this.get('adm3').get<string>('name') : '';
        name += this.get('adm4') && this.get('adm4').get('name') ? ' ' + this.get('adm4').get<string>('name') : '';
        return name;

    }

    public modelToApi(): Object {
        return {
            adm1: this.get('adm1') ? this.get('adm1').get('id') : null,
            adm2: this.get('adm2') ? this.get('adm2').get('id') : null,
            adm3: this.get('adm3') ? this.get('adm3').get('id') : null,
            adm4: this.get('adm4') ? this.get('adm4').get('id') : null,
        };
    }

    public getIdentifyingName() {
        return this.getLocationName();
    }

}
