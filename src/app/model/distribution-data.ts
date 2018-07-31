import { SectorMapper } from "./sector-mapper";
import { Location } from "./location";
import { Project } from "./project";
import { SelectionCriteria } from "./selection-criteria";
import { Sector } from "./sector";
import { GlobalText } from "../../texts/global";

export class DistributionData {
    static __classname__ = 'DistributionData';
    /**
     * DistributionData's id
     * @type {number}
     */
    id: number;
    /**
     * DistributionData's name
     * @type {string}
     */
    name: string = '';
    /**
     * DistributionData's updated_on
     * @type {Date}
     */
    updated_on: Date;
    /**
     * DistributionData's location
     * @type {Location}
     */
    location: Location;
    /**
     * DistributionData's location
     * @type {Project}
     */
    project: Project;
    /**
     * DistributionData's selectionCriteria
     * @type {SelectionCriteria}
     */
    selection_criteria: SelectionCriteria;
    /**
     * DistributionData's location
     * @type {string}
     */
    location_name: string;
    /**
     * DistributionData's location Administrate level 1
     * @type {string}
     */
    adm1: string = '';

     /**
     * DistributionData's location Administrate level 2
     * @type {string}
     */
    adm2: string = '';

     /**
     * DistributionData's location Administrate level 3
     * @type {string}
     */
    adm3: string = '';

     /**
     * DistributionData's location Administrate level 4
     * @type {string}
     */
    adm4: string = '';
    /**
     * DistributionData's number_beneficiaries
     * @type {Int16Array}
     */
    number_beneficiaries: Int16Array;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.name = instance.name;
            this.updated_on = instance.updated_on;
            this.number_beneficiaries = instance.number_beneficiaries;
            this.adm1 = instance.location.adm1;
            this.adm2 = instance.location.adm2;
            this.adm3 = instance.location.adm3;
            this.adm4 = instance.location.adm4;
        }
    }

    public static getDisplayedName(){
        return GlobalText.TEXTS.model_distribution;
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            id: selfinstance.id,
            name: selfinstance.name,
            updated_on: selfinstance.updated_on,
            location: Object.assign({}, selfinstance.location),
            project: Object.assign({}, selfinstance.project),
            selection_criteria: Object.assign({}, selfinstance.selection_criteria),
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
        }
    }

    /**
    * return a DistributionData after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
        }
    }

    /**
    * return a DistributionData after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
        }
    }

    /**
    * return a DistributionData after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
        }
    }

    /**
     * return a Project after formatting its properties for the modal add
     */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            adm1: selfinstance.adm1,
            adm2: selfinstance.adm2,
            adm3: selfinstance.adm3,
            adm4: selfinstance.adm4,
        }
    }

    /**
    * return the type of DistributionData properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            name: "text",
            location_name: "text",
            number_beneficiaries: "number",
            adm1: "text",
            adm2: "text",
            adm3: "text",
            adm4: "text",
        }
    }

    /**
    * return the type of DistributionData properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            name: "text",
            location_name: "text",
            number_beneficiaries: "number",
        }
    }

    /**
    * return DistributionData properties name displayed
    */
    static translator(): Object {
        return {
            name: GlobalText.TEXTS.model_distribution_name,
            location_name: GlobalText.TEXTS.model_distribution_location_name,
            number_beneficiaries: GlobalText.TEXTS.model_distribution_number_beneficiaries,
            adm1: GlobalText.TEXTS.model_distribution_adm1,
            adm2: GlobalText.TEXTS.model_distribution_adm2,
            adm3: GlobalText.TEXTS.model_distribution_adm3,
            adm4: GlobalText.TEXTS.model_distribution_adm4,
        }
    }

    public static formatArray(instance): DistributionData[] {
        let distributionDatas: DistributionData[] = [];
        instance.forEach(element => {
            distributionDatas.push(this.formatFromApi(element));
        });
        return distributionDatas;
    }

    public static formatFromApi(element: any): DistributionData {
        let distributionDatas = new DistributionData(element);
        distributionDatas.location = new Location(element.location);
        distributionDatas.location_name = element.location.adm1;
        distributionDatas.project = new Project(element.project);
        distributionDatas.selection_criteria = new SelectionCriteria(element.selection_criteria);
        return distributionDatas;
    }

    public static formatForApi(element: DistributionData): any {
        let distributionDatas = new DistributionData(element);
    }
}