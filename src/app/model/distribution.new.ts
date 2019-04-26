
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { Commodity } from './commodity.new';
import { Criteria } from './criteria.new';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { MultipleObjectsModelField } from './CustomModel/multiple-object-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { DistributionBeneficiary } from './distribution-beneficiary.new';
import { Location } from './location.new';
import { Project } from './project.new';
export class DistributionType extends CustomModel {

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
export class Distribution extends CustomModel {

    constructor() {
        super();
    }


    public static rights = ['ROLE_ADMIN', 'ROLE_PROJECT_MANAGER'];
    public static rightsEdit = ['ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_PROJECT_OFFICER'];
    matSortActive = 'date';
    title = this.language.distribution;


    public fields = {
        id: new NumberModelField(
            {
                // Not displayed anywhere
            }
            ),
        name: new TextModelField(
            {
                title: this.language.model_distribution_name,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        location: new ObjectModelField<Location> (
            {
                title: this.language.location,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                isDisplayedInSummary: true,
                displayTableFunction: null,
                displayModalFunction: null,
            }
        ),
        distributionBeneficiaries: new MultipleObjectsModelField<DistributionBeneficiary>(
            {
                title: this.language.beneficiaries,
                isDisplayedInTable: true,
                displayTableFunction: null,
                isDisplayedInSummary: true,
                value: [],
            }
        ),
        date: new DateModelField(
            {
                title: this.language.model_distribution_date,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isDisplayedInSummary: true,
                isRequired: true,
                isSettable: true,
                isEditable: true,
            }
        ),
        project: new ObjectModelField<Project>(
            {
                title: this.language.project,
                displayTableFunction: null,
                isDisplayedInSummary: true,
                value: [],
            }
        ),

        // We need this field when we want to create a distribution in a precise project
        projectId: new NumberModelField(
            {
                title: this.language.project
            }
        ),
        selectionCriteria: new MultipleObjectsModelField<Criteria>(
            {

            }
        ),
        type: new SingleSelectModelField(
            {
                title: this.language.model_distribution_type,
                placeholder: null,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isDisplayedInSummary: true,
                isRequired: true,
                isSettable: true,
                options: [new DistributionType('0', this.language.households), new DistributionType('1', this.language.individual)],
                bindField: 'name',
                apiLabel: 'name',
                value: this.language.households,
            }
        ),
        commodities: new MultipleObjectsModelField<Commodity> (
            {
                title: this.language.model_commodity,
                isDisplayedInTable: true,
                isImageInTable: true,
                isDisplayedInSummary: true,
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
        newDistribution.set('id', distributionFromApi.id);
        newDistribution.set('date', distributionFromApi.date_distribution);

        newDistribution.set('type', distributionFromApi.type >= 0  ?
            newDistribution.getOptions('type').filter(
                (option: DistributionType) => distributionFromApi.type.toString() === option.get('id'))[0] :
            null);

        newDistribution.set('name', distributionFromApi.name);
        newDistribution.set('validated', distributionFromApi.validated);
        newDistribution.set('location', distributionFromApi.location ? Location.apiToModel(distributionFromApi.location) : null);
        newDistribution.set('project', distributionFromApi.project ? Project.apiToModel(distributionFromApi.project) : null);

        newDistribution.fields.location.displayTableFunction = value => value.getLocationName();
        newDistribution.fields.location.displayModalFunction = value => value.getLocationName();
        newDistribution.fields.distributionBeneficiaries.displayTableFunction = value => value.length;
        newDistribution.fields.commodities.displayTableFunction = value => this.displayCommodities(value);
        newDistribution.fields.project.displayTableFunction = (value: Project) => value.get('name');

        newDistribution.set('commodities',
        distributionFromApi.commodities ?
            distributionFromApi.commodities.map((commodity: any) => Commodity.apiToModel(commodity)) :
            null);

        newDistribution.set('finished', true);

        if (distributionFromApi.distribution_beneficiaries) {
            distributionFromApi.distribution_beneficiaries.forEach(benef => {
                if (benef.transactions.length === 0) {
                    newDistribution.set('finished', false);
                } else if (benef.transactions && benef.transactions[0].transaction_status !== 1) {
                    newDistribution.set('finished', false);
                }
            });

            newDistribution.set('distributionBeneficiaries',
                distributionFromApi.distribution_beneficiaries
                    .map((distributionBeneficiary: any) =>
                        DistributionBeneficiary.apiToModel(distributionBeneficiary, distributionFromApi.id)));
        }

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

        const commodities = this.get('commodities') ?
            this.get<Commodity[]>('commodities').map(commodity => commodity.modelToApi()) :
            [];
        const location = this.get('location').modelToApi();
        const project = { id: this.get('projectId') };
        const selectionCriteria = this.get('selectionCriteria') ?
            this.get<Criteria[]>('selectionCriteria').map(criteria => criteria.modelToApi()) :
            [];

        return {
            id: this.get('id'),
            commodities: commodities,
            date_distribution: this.fields.date.formatForApi(),
            finished: false,
            location: location,
            name: this.get('name'),
            project: project,
            selection_criteria: selectionCriteria,
            threshold: this.get('threshold'),
            type: this.get('type')
        };

    }

    public getIdentifyingName() {
        return this.get<string>('name');
    }

    // In modelToAPi put date.toLocaleDateString()
}
