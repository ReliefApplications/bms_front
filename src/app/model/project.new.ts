import { Sector } from './sector';
import { SectorMapper } from './sector-mapper';
import { Donor } from './donor';
import { GlobalText } from '../../texts/global';
import { AppObject } from './app-object';
import { AppObjectField } from './app-object-field';

export class NewProject implements AppObject {
    static __classname__ = 'Project';
    /**
     * Project's id
     * @type {number}
     */
    id: number;
    /**
     * Project's name
     * @type {string}
     */
    name = '';
    /**
    * Project's sector
    * @type {string[]}
    */
    sectors_name: string[] = [];
    /**
     * Project's sector
     * @type {Sector[]}
     */
    sectors: Sector[] = [];
    /**
     * Project's start_date
     * @type {Date}
     */
    start_date: Date;
    /**
     * Project's end_date
     * @type {Date}
     */
    end_date: Date;
    /**
     * Project's number_of_households
     * @type {number}
     */
    number_of_households: number;
    /**
    * Project's donors
    * @type {string[]}
    */
    donors_name: string[] = [];
    /**
     * Project's donors
     * @type {Donor[]}
     */
    donors: Donor[] = [];
    /**
     * Project's iso3
     * @type {string}
     */
    iso3: string;
    /**
     * Project's value
     * @type {Float32Array}
     */
    value: Float32Array;
    /**
     * Project's notes
     * @type {string}
     */
    notes: string;
    private fields = {
        id : new AppObjectField(
            {
                isHidden: true,
            }
        ),
        name : new AppObjectField(
            {
                required: true,
                displayedInTable: true,
            }
        ),
        sectors_name : new AppObjectField(
            {

            }

        ),
        sectors : new AppObjectField({}),
        start_date : new AppObjectField({}),
        end_date : new AppObjectField({}),
        number_of_households : new AppObjectField({}),
        donors_name : new AppObjectField({}),
        donors : new AppObjectField({}),
        iso3 : new AppObjectField({}),
        value : new AppObjectField({}),
    };
    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.name = instance.name;
            this.start_date = instance.start_date ? instance.start_date : new Date();
            this.end_date = instance.end_date ? instance.end_date : new Date();
            this.number_of_households = instance.number_of_households;
            this.iso3 = instance.iso3 ? instance.iso3 : '';
            this.value = instance.value ? instance.value : null;
            this.notes = instance.notes ? instance.notes : '';
        }
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
