import { AppInjector } from '../app-injector';
import { CountriesService } from '../core/countries/countries.service';
import { Gender } from './beneficiary';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';

export class CriteriaCondition extends CustomModel {

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
export class CriteriaType extends CustomModel {

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

export class CriteriaValue extends CustomModel {

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
export class Criteria extends CustomModel {
    title =  this.language.criteria;
    matSortActive = 'field';

    protected countryService = AppInjector.get(CountriesService);
    public country = this.countryService.selectedCountry.get<string>('id') ?
    this.countryService.selectedCountry.get<string>('id') :
    this.countryService.khm.get<string>('id');

    public genders = [
        new Gender('0', this.language.female),
        new Gender('1', this.language.male)
    ];

    public fields = {
        // id: new NumberModelField(
        //     {
        //         // Not displayed anywhere
        //     }
        // ),
        target: new TextModelField(
            {
                title: this.language.criteria_target,
                isDisplayedInTable: true,
                isTranslatable: true
            }
        ),
        tableString: new TextModelField({

        }),
        field: new TextModelField(
            {
                title: this.language.criteria,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                isRequired: true,
                isTranslatable: true
            }
        ),
        condition: new SingleSelectModelField(
            {
                title: this.language.criteria_operator,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                isRequired: true,
                bindField: 'name',
                apiLabel: 'name'
            }
        ),
        type: new TextModelField(
            {
            }
        ),

        // Not really a single select, but can have an id and string, as gender for example
        value: new SingleSelectModelField(
            {
                title: this.language.value,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                bindField: 'name',
                apiLabel: 'id'
            }
        ),
        weight: new NumberModelField(
            {
                title: this.language.criteria_weight,
                value: 1,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
            }
        ),

    };

    public static apiToModel(criteriaFromApi: any): Criteria {
        const newCriteria = new Criteria();

        newCriteria.set('field', criteriaFromApi.field_string);
        newCriteria.set('type', criteriaFromApi.type);
        newCriteria.set('target', criteriaFromApi.target);
        newCriteria.set('tableString', criteriaFromApi.table_string);

        // If it is a criteria associated with a distribution, it already has a value and condition
        const condition = criteriaFromApi.condition_string;
        newCriteria.set('condition', condition ? new CriteriaCondition(null, condition) : null);
        const value = criteriaFromApi.value_string;
        if (criteriaFromApi.field_string === 'gender' && value) {
            const genderValue = newCriteria.genders.filter((gender: Gender) => gender.get('id') === value)[0];
            newCriteria.set('value', new CriteriaValue(value, genderValue.get('name')));
        }
        else {
            newCriteria.set('value', new CriteriaValue(value, value));
        }
        const weight = criteriaFromApi.weight;
        newCriteria.set('weight', weight ? weight : 1);

        return newCriteria;
    }

    public modelToApi(): Object {
        return {
            condition_string: this.fields.condition.formatForApi(),
            field_string: this.fields.field.formatForApi(),
            target: this.fields.target.formatForApi(),
            table_string: this.fields.tableString.formatForApi(),
            value_string: this.fields.value.formatForApi(),
            weight: this.fields.weight.formatForApi(),
            type: this.fields.type.formatForApi(),
        };
    }

    public getIdentifyingName() {
        return this.get('field').get<string>('name');
    }
}
