
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
import { SelectionCriteria } from './selection-criteria';
import { Beneficiary } from './beneficiary.new';
import { GlobalText } from 'src/texts/global';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';

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
                displayFunction: null,
            }
        ),
        beneficiaries: new MultipleObjectsModelField<Beneficiary>(
            {
                title: GlobalText.TEXTS.beneficiaries,
                isDisplayedInTable: true,
                displayFunction: null,
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
        project: new ObjectModelField<Project>(
            {
                title: GlobalText.TEXTS.project
            }
        ),
        selectionCriteria: new MultipleObjectsModelField<SelectionCriteria>(
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
                        name: { value: 'Household'},
                        id: { value: 0}
                    }},
                    { fields : {
                        name: { value: 'Beneficiary'},
                        id: { value: 1}
                    }},
                ],
                bindField: 'name',
                apiLabel: 'id',
            }
        ),
        commodities: new MultipleObjectsModelField<Commodity> (
            {
                title: GlobalText.TEXTS.model_commodity,
                isDisplayedInTable: true,
                isImageInTable: true,
                value: [],
                displayFunction: null,
            }
        ),
        validated: new BooleanModelField(
            {
                // Not displayed anywhere but used as a condition
            }
        ),
        threshold: new NumberModelField(
            {

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

        newDistribution.fields.location.displayFunction = value => value.getLocationName();
        newDistribution.fields.beneficiaries.displayFunction = value => value.length;
        newDistribution.fields.commodities.displayFunction = value => this.displayCommodities(value);


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
}
