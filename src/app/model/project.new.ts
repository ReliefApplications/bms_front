import { Sector } from './sector';
import { Donor } from './donor';
import { AppObject } from './app-object';
import { AppObjectField } from './app-object-field';

export class Project extends AppObject {

    public fields = {
        id : new AppObjectField<number>(
            {
                isHidden: true,
            }
        ),
        name : new AppObjectField<string>(
            {
                isDisplayedInTable: true,
                isRequired: true,
                isSettable: true,
            }
        ),
        sectorsName : new AppObjectField<string[]>(
            {
                isMultipleSelect: true,
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        sectors : new AppObjectField<Sector[]>(
            {
                isDisplayedInTable: true,
            }
        ),
        startDate : new AppObjectField<Date>(
            {
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        endDate : new AppObjectField<Date>(
            {
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        numberOfHouseholds : new AppObjectField<number>(
            {
                isDisplayedInTable: true,
            }
        ),
        donorsName : new AppObjectField<string[]>(
            {
                isDisplayedInTable: true,
                isSettable: true,
            }
        ),
        donors : new AppObjectField<Donor[]>(
            {

            }
        ),
        iso3 : new AppObjectField<string>(
            {

            }
        ),
        value : new AppObjectField<number[]>(
            {
                required: true,
                isSettable: true,
            }
        ),
        notes : new AppObjectField<string>(
            {
                isSettable: true,
                isUpdatable: true,
            }
        ),
    };

    constructor() {
        super();

    }

    public  apiToModel(): Object {
        return new Object;
    }
    public  modelToApi(object: Object): void {

    }
    public  getDisplayedName(): Object {
        return new Object;
    }
}
