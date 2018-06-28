import { Sector             } from "./sector"

export class Project {
    static __classname__ = 'Project';
    /**
     * Project's name
     * @type {string}
     */
    name: string = '';
    /**
     * Project's string
     * @type {string}
     */
    sector: string;
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
     * Project's numberOfHouseholds
     * @type {number}
     */
    numberOfHouseholds: number;
     /**
     * Project's donors
     * @type {string}
     */
    donors: string;

    constructor(instance?){
        if(instance !== undefined){
            this.name = instance.name;
            this.sector = instance.sector;
            this.start_date = instance.start_date;
            this.end_date = instance.end_date;
            this.numberOfHouseholds = instance.numberOfHouseholds;
            this.donors = instance.donors;
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
            sector : selfinstance.sector,
            start_date : selfinstance.start_date,
            end_date : selfinstance.end_date,
            numberOfHouseholds : selfinstance.numberOfHouseholds,
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
            sector : selfinstance.sector,
            start_date : selfinstance.start_date,
            end_date : selfinstance.end_date,
            numberOfHouseholds : selfinstance.numberOfHouseholds,
            donors : selfinstance.donors            
        } 
    }

    /**
    * return the type of Project properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            name : "text",
            sector : "text",
            start_date : "date",
            end_date : "date",
            numberOfHouseholds : "number",
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
            numberOfHouseholds:"Number of Households",
            donors : "Donors",
        }
    }

    public static formatArray(instance): Project[]{
        let projects : Project[] = [];
        instance.forEach(element => {
            projects.push(this.formatDonor(element));
        });
        return projects;
    }

    public static formatDonor(element: any): Project{
        let project = new Project();
        project.name = element.name;
        element.sectors.forEach(element => {
            element.sectors = " "+element+" ";
        });
        project.start_date = element.start_date;
        project.end_date = element.end_date;
        project.numberOfHouseholds = element.numberOfHouseholds;
        element.donors.forEach(element => {
            element.donors = " "+element+" ";
        });
        return project;
    }
}