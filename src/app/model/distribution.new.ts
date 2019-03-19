
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { Beneficiaries } from './beneficiary';
import { BooleanModelField } from './CustomModel/boolan-model-field';
import { CustomModelField } from './CustomModel/custom-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { Location } from './location';
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

            }
        ),
        // updatedOn(useless),
        location: new CustomModelField<Location>(
            {

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
        locationName: new TextModelField(
            {

            }
        ),
        adm1: new TextModelField(
            {

            }
        ),
        adm2: new TextModelField(
            {

            }
        ),
        adm3: new TextModelField(
            {

            }
        ),
        adm4: new TextModelField(
            {

            }
        ),
        // beneficiaryCount(useless),
        type: new TextModelField(
            {

            }
        ),
        date: new DateModelField(
            {

            }
        ),
        commodity: new TextModelField(
            {

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
        beneficiaries: new CustomModelField<Beneficiaries>(
            {

            }
        ),

    };
    apiToModel(): object {
        return new Object;
    }
}
