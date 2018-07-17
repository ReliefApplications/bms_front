import { SectorMapper                                                   } from "./sector-mapper";
import { Location                                                       } from "./location";
import { Project                                                        } from "./project";
import { SelectionCriteria                                              } from "./selection-criteria";
import { Sector                                                         } from "./sector";

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
     * DistributionData's sector
     * @type {string[]}
     */
    sectors_name: string[] = [];
    /**
     * DistributionData's sector
     * @type {Sector[]}
     */
    sectors: Sector[] = [];
    /**
     * DistributionData's location
     * @type {string}
     */
    location_name: string;
    /**
     * DistributionData's number_beneficiaries
     * @type {Int16Array}
     */
    number_beneficiaries: Int16Array;

    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.name = instance.name;
            this.updated_on = instance.updated_on;
            this.number_beneficiaries = instance.number_beneficiaries;
        }
    }

    mapAllProperties(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;

        return {
            id : selfinstance.id,
            name : selfinstance.name,
            updated_on : selfinstance.updated_on,
            location : Object.assign({},selfinstance.location),
            project : Object.assign({},selfinstance.project),
            selection_criteria : Object.assign({},selfinstance.selection_criteria),
            sectors_name : selfinstance.sectors_name,
            sectors : Object.assign({},selfinstance.sectors),
            location_name : selfinstance.location_name,
            number_beneficiaries : selfinstance.number_beneficiaries,
        }
    }

    /**
    * return a DistributionData after formatting its properties
    */
    getMapper(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
            sectors_name: SectorMapper.mapSectors(selfinstance.sectors_name),
        }
    }

    /**
    * return a DistributionData after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object{
        if(!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            location_name: selfinstance.location_name,
            number_beneficiaries: selfinstance.number_beneficiaries,
            sectors_name: selfinstance.sectors_name,
        }  
    }

    /**
    * return the type of DistributionData properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            name: "text",
            location_name:"text",
            number_beneficiaries:"number",
            sectors_name: "image",
        }
    }

    /**
    * return DistributionData properties name displayed
    */
    static translator(): Object {
        return {
            name: "Distribution",
            location_name:"Location",
            number_beneficiaries:"n° Beneficiaries",
            sectors_name: "Sectors",
        }
    }

    public static formatArray(instance): DistributionData[]{
        let distributionDatas : DistributionData[] = [];
        instance.forEach(element => {
            distributionDatas.push(this.formatFromApi(element));
        });
        return distributionDatas;
    }

    public static formatFromApi(element: any): DistributionData{
        let distributionDatas = new DistributionData(element);
        distributionDatas.location = new Location(element.location);
        distributionDatas.location_name = element.location.adm1;
        distributionDatas.project = new Project(element.project);
        distributionDatas.selection_criteria = new SelectionCriteria(element.selection_criteria);
        element.project.sectors.forEach(sector => {
            distributionDatas.sectors.push(new Sector(sector));
            distributionDatas.sectors_name.push(sector.name);
        });
        return distributionDatas;
    }

    public static formatForApi(element: DistributionData): any{
        let distributionDatas = new DistributionData(element);
    }
}