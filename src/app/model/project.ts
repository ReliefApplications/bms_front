import { Sector             } from "./sector"

export class Project {
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
    name: string = '';
    /**
     * Project's string
     * @type {string}
     */
    sectors: string;
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
     * @type {string}
     */
    donors: string;
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

    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.name = instance.name;
            this.start_date = instance.start_date;
            this.end_date = instance.end_date;
            this.number_of_households = instance.number_of_households;
            this.iso3 = instance.iso3;
            this.value = instance.value;
            this.notes = instance.notes;
        }
    }

    mapAllProperties(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;

        return {
            id : selfinstance.id,
            name : selfinstance.name,
            start_date : selfinstance.start_date,
            end_date : selfinstance.end_date,
            number_of_households : selfinstance.number_of_households,
            iso3 : selfinstance.iso3,
            notes : selfinstance.notes,
            value : selfinstance.value,
        }
    }

    /**
    * return a Project after formatting its properties
    */
    getMapper(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;

        return {
            name : selfinstance.name,
            sectors : selfinstance.sectors,
            start_date : selfinstance.start_date,
            end_date : selfinstance.end_date,
            number_of_households : selfinstance.number_of_households,
            donors : selfinstance.donors
        }
    }

    /**
    * return a Project after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object{
        if(!selfinstance)
            return selfinstance;

        return {
            name : selfinstance.name,
            sectors : selfinstance.sectors,
            start_date : selfinstance.start_date,
            end_date : selfinstance.end_date,
            number_of_households : selfinstance.number_of_households,
            donors : selfinstance.donors            
        } 
    }

    /**
    * return the type of Project properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            name : "text",
            sectors : "text",
            start_date : "date",
            end_date : "date",
            number_of_households : "number",
            donors : "text",
        }
    }

    /**
    * return Project properties name displayed
    */
    static translator(): Object {
        return {
            name: "Project",
            sectors:"Sectors",
            start_date:"Start Date",
            end_date:"End Date",
            number_of_households:"Number of Households",
            donors : "Donors",
        }
    }

    public static formatArray(instance): Project[]{
        let projects : Project[] = [];
        instance.forEach(element => {
            projects.push(this.formatProject(element));
        });
        return projects;
    }

    public static formatProject(element: any): Project{
        let project = new Project(element);
        element.sectors.forEach(element => {
            project.sectors = " "+element+" ";
        });
        element.donors.forEach(element => {
            project.donors = " "+element+" ";
        });
        return project;
    }

    public static formatForApi(element: Project): any{
        return new Project(element);
    }
}