import { SectorMapper } from './sector-mapper';
import { Location } from './location';
import { Project } from './project';
import { SelectionCriteria } from './selection-criteria';
import { Sector } from './sector';
import { GlobalText } from '../../texts/global';
import { Commodity } from './commodity';

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
    name = '';
    /**
     * DistributionData's updated_on
     * @type {Date}
     */
    updated_on: Date;
    /**
     * DistributionData's location
     * @type {Location}
     */
    location: Location = new Location;
    /**
     * DistributionData's location
     * @type {Project}
     */
    project: Project = new Project;
    /**
     * DistributionData's selectionCriteria
     * @type {Array}
     */
    selection_criteria: Array<SelectionCriteria>;
    /**
     * DistributionData's location
     * @type {string}
     */
    location_name = '';
    /**
     * DistributionData's location Administrate level 1
     * @type {string}
     */
    adm1 = '';

     /**
     * DistributionData's location Administrate level 2
     * @type {string}
     */
    adm2 = '';

     /**
     * DistributionData's location Administrate level 3
     * @type {string}
     */
    adm3 = '';

     /**
     * DistributionData's location Administrate level 4
     * @type {string}
     */
    adm4 = '';
    /**
     * DistributionData's number_beneficiaries
     * @type {Int16Array}
     */
    number_beneficiaries: Int16Array;
    /**
     * DistributionData's type
     * Could be 1 or 0
     * 1 represent beneficiary
     * 0 represent household
     * @type {type}
     */
    type: string;
    /**
     * DistributionData's data of distribution
     * @type {string}
     */
    date_distribution: string;
    /**
     * Distribution data's commodity
     * @type {Array}
     */
    commodities: Array<Commodity>;
    /**
     * validated or not
     */
    validated: boolean;

    constructor(instance?) {
        if (instance !== undefined && instance != null) {
            this.id = instance.id;
            this.name = instance.name;
            this.updated_on = instance.updated_on;
            this.number_beneficiaries = instance.distribution_beneficiaries.length;
            instance.location = instance.location || {}; // TODO: remove this line when backend bug fixed
            this.adm1 = instance.location.adm1;
            this.adm2 = instance.location.adm2;
            this.adm3 = instance.location.adm3;
            this.adm4 = instance.location.adm4;
            this.type = instance.type;
            this.date_distribution = instance.date_distribution;
            this.validated = instance.validated;
        }
    }

    public static getDisplayedName() {
        return GlobalText.TEXTS.model_distribution;
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            id: selfinstance.id,
            name: selfinstance.name,
            updated_on: selfinstance.updated_on,
            location: Object.assign({}, selfinstance.location),
            project: Object.assign({}, selfinstance.project),
            selection_criteria: Object.assign({}, selfinstance.selection_criteria),
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
            type: selfinstance.type,
            date_distribution: selfinstance.date_distribution,
            validated: selfinstance.validated,
        };
    }

    /**
    * return a DistributionData after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
            date_distribution: selfinstance.date_distribution,
            type: selfinstance.type
        };
    }

    /**
    * return a DistributionData after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
            date_distribution: selfinstance.date_distribution,
            type: selfinstance.type
        };
    }

    /**
    * return a DistributionData after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
            date_distribution: selfinstance.date_distribution,
            type: selfinstance.type
        };
    }

    /**
     * return a Project after formatting its properties for the modal add
     */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            // name: selfinstance.name,
            adm1: selfinstance.adm1,
            adm2: selfinstance.adm2,
            adm3: selfinstance.adm3,
            adm4: selfinstance.adm4,
            date_distribution: selfinstance.date_distribution,
            type: selfinstance.type
        };
    }

    /**
     * return a Project after formatting its properties for the property box
     */
    getMapperBox(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        let location;
        if (selfinstance.location.adm1) {
            location = selfinstance.location.adm1.name;
        } else if (selfinstance.location.adm2) {
            location = selfinstance.location.adm2.name;
        } else if (selfinstance.location.adm3) {
            location = selfinstance.location.adm3.name;
        } else if (selfinstance.location.adm4) {
            location = selfinstance.location.adm4.name;
        }

        let distType;
        if (selfinstance.type === 0) {
            distType = 'Beneficiary';
        } else {
            distType = 'Household';
        }

        let num;
        if (selfinstance.distribution_beneficiaries) {
            num = selfinstance.distribution_beneficiaries.length;
        } else {
            num = 0;
        }

        return {
            date_distribution: selfinstance.date_distribution,
            location_name: location,
            number_beneficiaries: num,
            type: distType,
        };
    }

    /**
    * return the type of DistributionData properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            // name: "text",
            location_name: 'text',
            number_beneficiaries: 'number',
            adm1: 'select',
            adm2: 'select',
            adm3: 'select',
            adm4: 'select',
            date_distribution: 'date',
            type: 'radio'
        };
    }

    /**
    * return the type of DistributionData properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            name: 'text',
            location_name: 'text',
            number_beneficiaries: 'number',
        };
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
            date_distribution : GlobalText.TEXTS.model_distribution_date,
            type : 'Type'
        };
    }

    // Renvoie un array des datas depuis l'objet récupéré de l'Api.
    public static formatArray(instance): DistributionData[] {
        const distributionDatas: DistributionData[] = [];
        // console.log("formatArray before :", distributionDatas);
        instance.forEach(element => {
            if (element && element.id && element.location && element.project && element.name) {
                distributionDatas.push(this.formatFromApi(element));
            }
        });
        return distributionDatas;
    }

    // Json -> DistributionData
    public static formatFromApi(element: any): DistributionData {
        const distributionDatas = new DistributionData(element);
        distributionDatas.location = new Location(element.location);
        distributionDatas.project = new Project(element.project);
        distributionDatas.selection_criteria = [];
        const selectionCriteria = new SelectionCriteria(element.selection_criteria);
        distributionDatas.selection_criteria.push(selectionCriteria);

        if (element.location.adm1) {
            distributionDatas.location_name += element.location.adm1.name + ' ';
        }
        if (element.location.adm2) {
            distributionDatas.location_name += element.location.adm2.name + ' ';
        }
        if (element.location.adm3) {
            distributionDatas.location_name += element.location.adm3.name + ' ';
        }
        if (element.location.adm4) {
            distributionDatas.location_name += element.location.adm4.name + ' ';
        }

        if (distributionDatas.number_beneficiaries) {
            distributionDatas.number_beneficiaries = element.distribution_beneficiaries.length;
        }

        return distributionDatas;
    }

    // DistributionData -> Json
    public static formatForApi(element: DistributionData): any {

        // TODO : recréer le champ location en attribuant chaque valeur de element à chaque champ de location
        // >>>>>  Placer dans l'input de update de location une selection des 4 possiblités liées à la BDD (ex: addDistribution).

        const updatedDistribution = {
            id : element.id, // id
            name : element.name, // name
            updated_on : element.updated_on, // updated_on
            date_distribution : element.date_distribution, // date_distribution
            location : element.location, // location
            project : element.project, // project
            selection_criteria : element.selection_criteria, // selection_criteria
            archived : false, // archived
            validated : true, // validated
            reporting_distribution : {}[0], // reporting_distribution
            type : element.type, // type
            commodities : element.commodities, // commodities
            distribution_beneficiaries : {}[0] // distribution_beneficiaries
        };

        return(updatedDistribution);
    }


}
