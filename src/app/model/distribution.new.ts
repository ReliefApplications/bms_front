
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { Beneficiaries } from './beneficiary';
import { Commodity } from './commodity.new';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { CustomModelField } from './CustomModel/custom-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { Location } from './location.new';
import { Project } from './project.new';
import { Beneficiary } from './beneficiary.new';
import { GlobalText } from 'src/texts/global';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { Criteria } from './criteria.new';

export class Distribution extends CustomModel {

    constructor() {
        super();
    }


    public static rights = ['ROLE_ADMIN', 'ROLE_PROJECT_MANAGER'];
    public static rightsEdit = ['ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_PROJECT_OFFICER'];
    title = GlobalText.TEXTS.distribution;


    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
            }
            ),
        name: new TextModelField(
            {
                title: GlobalText.TEXTS.model_distribution_name,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        location: new ObjectModelField<Location> (
            {
                title: GlobalText.TEXTS.location,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                displayTableFunction: null,
                displayModalFunction: null,
            }
        ),
        beneficiaries: new MultipleObjectsModelField<Beneficiary>(
            {
                title: GlobalText.TEXTS.beneficiaries,
                isDisplayedInTable: true,
                displayTableFunction: null,
                value: [],
            }
        ),
        date: new DateModelField(
            {
                title: GlobalText.TEXTS.model_distribution_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                isEditable: true,
            }
        ),
        projectId: new NumberModelField(
            {
                title: GlobalText.TEXTS.project
            }
        ),
        selectionCriteria: new MultipleObjectsModelField<Criteria>(
            {

            }
        ),
        type: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.model_distribution_type,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
                options: [
                    { fields : {
                        name: { value: GlobalText.TEXTS.households},
                        id: { value: 0}
                    }},
                    { fields : {
                        name: { value: GlobalText.TEXTS.individual},
                        id: { value: 1}
                    }},
                ],
                bindField: 'name',
                apiLabel: 'name',
                value: GlobalText.TEXTS.households,
            }
        ),
        commodities: new MultipleObjectsModelField<Commodity> (
            {
                title: GlobalText.TEXTS.model_commodity,
                isDisplayedInTable: true,
                isImageInTable: true,
                value: [],
                displayTableFunction: null,
            }
        ),
        validated: new BooleanModelField(
            {
                // Not displayed anywhere but used as a condition
            }
        ),
        threshold: new NumberModelField(
            {
                value: 1,
            }
        ),
        finished: new BooleanModelField(
            {
                // Not displayed anywhere but used as a condition
            }
        ),
    };

    public static apiToModel(distributionFromApi: any): Distribution {
        const newDistribution = new Distribution();

        // Assign default fields
        newDistribution.fields.id.value = distributionFromApi.id;
        newDistribution.fields.date.value = distributionFromApi.date_distribution;
        newDistribution.fields.type.value = newDistribution.fields.type.options[distributionFromApi.type];
        newDistribution.fields.name.value = distributionFromApi.name;
        newDistribution.fields.validated.value = distributionFromApi.validated;
        newDistribution.fields.location.value = Location.apiToModel(distributionFromApi.location);

        newDistribution.fields.location.displayTableFunction = value => value.getLocationName();
        newDistribution.fields.location.displayModalFunction = value => value.getLocationName();
        newDistribution.fields.beneficiaries.displayTableFunction = value => value.length;
        newDistribution.fields.commodities.displayTableFunction = value => this.displayCommodities(value);


        distributionFromApi.distribution_beneficiaries.forEach(beneficiary => {
            newDistribution.fields.beneficiaries.value.push(Beneficiary.apiToModel(beneficiary));
        });
        distributionFromApi.commodities.forEach(commodity => {
            newDistribution.fields.commodities.value.push(Commodity.apiToModel(commodity));
        });

        newDistribution.fields.finished.value = true;
        distributionFromApi.distribution_beneficiaries.forEach(benef => {
            if (benef.transactions.length === 0) {
                newDistribution.fields.finished.value = false;
            } else if (benef.transactions && benef.transactions[0].transaction_status !== 1) {
                newDistribution.fields.finished.value = false;
            }
        });

        return newDistribution;
    }

    public static displayCommodities(value) {
        const images = [];
        value.forEach(commodity => {
            images.push(commodity.getImage());
        });
        return images;
    }

    public modelToApi(): Object {

        const commodities = this.fields.commodities.value ?
            this.fields.commodities.value.map(commodity => {
                return commodity.modelToApi();
            }) :
            [];
        const location = this.fields.location.value.modelToApi();
        const project = { id: this.fields.projectId.value };
        const selectionCriteria = this.fields.selectionCriteria.value ?
            this.fields.selectionCriteria.value.map(criteria => {
                return criteria.modelToApi();
            }) :
            [];

        return {
            id: this.fields.id.value,
            commodities: commodities,
            date_distribution: this.fields.date.formatForApi(),
            finished: false,
            location: location,
            name: this.fields.name.value,
            project: project,
            selection_criteria: selectionCriteria,
            threshold: this.fields.threshold.value,
            type: this.fields.type.value
        };

    }

    public getIdentifyingName() {
        return this.fields.name.value;
    }

    // In modelToAPi put date.toLocaleDateString()
}
