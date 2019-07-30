
import { AppInjector } from '../app-injector';
import { CountriesService } from '../core/countries/countries.service';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';

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

    public static apiToModel(admFromApi: any): Adm {
        return new Adm(admFromApi.id, admFromApi.name);
    }
}
export class Location extends CustomModel {

    protected countryService = AppInjector.get(CountriesService);
    // Country
    protected country = this.countryService.selectedCountry.get<string>('id') ?
        this.countryService.selectedCountry.get<string>('id') :
        this.countryService.khm.get<string>('id');


    title = 'Location';
    matSortActive = 'adm1';

    fields = {
        id: new NumberModelField(
            {

            }
        ),
        adm1: new SingleSelectModelField(
            {
                title: this.language.adm1[this.country],
                bindField: 'name',
                apiLabel: 'id',
                isRequired: true,
            }
        ),
        adm2: new SingleSelectModelField(
            {
                title: this.language.adm2[this.country],
                bindField: 'name',
                apiLabel: 'id',
            }
        ),
        adm3: new SingleSelectModelField(
            {
                title: this.language.adm3[this.country],
                bindField: 'name',
                apiLabel: 'id',
            }
        ),
        adm4: new SingleSelectModelField(
            {
                title: this.language.adm4[this.country],
                bindField: 'name',
                apiLabel: 'id',
            }
        ),
        codeForMap: new TextModelField({}),
        countryIso3: new TextModelField(
            {

            }
        ),
    };

    public static apiToModel(locationFromApi: any): Location {
        const newLocation = new Location();
        newLocation.set('id', locationFromApi.id);

        // Destructure locationFromApi into new variables
        let { adm1, adm2, adm3 } = locationFromApi;
        const { adm4 } = locationFromApi;

        // Cascade down the value of the most accurate element to the broader adm
        if (adm4) {
            adm3 = adm4.adm3;
        }
        if (adm3) {
            adm2 = adm3.adm2;
        }
        if (adm2) {
            adm1 = adm2.adm1;
        }

        // Exit if no adm were defined
        if (!adm1) {
            return newLocation;
        }

        newLocation.set('adm1', adm1 ? new Adm(adm1.id, adm1.name) : new Adm(null, null));
        newLocation.set('adm2', adm2 ? new Adm(adm2.id, adm2.name) : new Adm(null, null));
        newLocation.set('adm3', adm3 ? new Adm(adm3.id, adm3.name) : new Adm(null, null));
        newLocation.set('adm4', adm4 ? new Adm(adm4.id, adm4.name) : new Adm(null, null));

        // Set location code with most precise location
        if (adm3) {
            newLocation.set('codeForMap', adm3.code);
        } else if (adm2) {
            newLocation.set('codeForMap', adm2.code);
        } else {
            newLocation.set('codeForMap', adm1.code);
        }

        return newLocation;
    }


    getLocationName(): string {
        let name = this.get('adm1') && this.get('adm1').get('name') ? this.get('adm1').get<string>('name') : '';
        name += this.get('adm2') && this.get('adm2').get('name') ? ' ' + this.get('adm2').get<string>('name') : '';
        name += this.get('adm3') && this.get('adm3').get('name') ? ' ' + this.get('adm3').get<string>('name') : '';
        name += this.get('adm4') && this.get('adm4').get('name') ? ' ' + this.get('adm4').get<string>('name') : '';
        return name;
    }

    getPreciseLocationName() {
        if (this.get('adm4') && this.get('adm4').get('name')) {
            return this.get('adm4').get<string>('name');
        } else if (this.get('adm3') && this.get('adm3').get('name')) {
            return this.get('adm3').get<string>('name');
        } else if (this.get('adm2') && this.get('adm2').get('name')) {
            return this.get('adm2').get<string>('name');
        } else if (this.get('adm1') && this.get('adm1').get('name')) {
            return this.get('adm1').get<string>('name');
        }
    }

    public modelToApi(): Object {
        return {
            adm1: this.fields.adm1.formatForApi(),
            adm2: this.fields.adm2.formatForApi(),
            adm3: this.fields.adm3.formatForApi(),
            adm4: this.fields.adm4.formatForApi(),
        };
    }

    public getIdentifyingName() {
        return this.getLocationName();
    }

}
