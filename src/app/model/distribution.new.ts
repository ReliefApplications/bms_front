
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { Beneficiaries } from './beneficiary';
import { Commodity } from './commodity';
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

export class Distribution extends CustomModel {

    constructor() {
        super();
    }

    public fields = {
        id: new NumberModelField(
            {

            }
            ),
        name: new TextModelField(
            {
                isDisplayedInTable: true,
            }
        ),
        project: new CustomModelField<Project>(
            {

            }
        ),
        selectionCriteria: new CustomModelField<Array<SelectionCriteria>>(
            {

            }
        ),
        location: new ObjectModelField<Location> (
            {
                displayFunction: () => this.fields.location.value.getLocationName()
            }
        ),
        type: new TextModelField(
            {

            }
        ),
        date: new DateModelField(
            {

            }
        ),
        commodities: new ObjectModelField<Commodity> (
            {
                isDisplayedInTable: true,
                isImage: true,
            }
        ),
        validated: new BooleanModelField(
            {

            }
        ),
        threshold: new NumberModelField(
            {

            }
        ),
        beneficiaries: new MultipleObjectsModelField<Beneficiaries>(
            {
                displayFunction: () => this.fields.beneficiaries.value.length,
            }
        ),
    };

    public static apiToModel(distributionFromApi: any): Distribution {
        const newDistribution = new Distribution();

        // Assign default fields
        newDistribution.fields.date.value = distributionFromApi.date_distribution;
        newDistribution.fields.type.value = distributionFromApi.type;
        newDistribution.fields.name.value = distributionFromApi.name;
        newDistribution.fields.validated.value = distributionFromApi.validated;
        newDistribution.fields.location.value = Location.apiToModel(distributionFromApi.location);



        return newDistribution;
    }
}
