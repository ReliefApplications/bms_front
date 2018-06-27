import { SectorMapper        } from "./sector-mapper";

export class Donor {
    static __classname__ = 'Donor';
     /**
     * Donor's name
     * @type {string}
     */
    name: string = '';
    /**
     * Donor's fullname
     * @type {string}
     */
    fullname: string = '';
    /**
     * Donor's shortname
     * @type {string}
     */
    shortname: string = '';
     /**
     * Donor's notes
     * @type {string}
     */
    notes: string = '';
    /**
     * Donor's proojects
     * @type {string}
     */
    projects: string;

    constructor(instance?){
        if(instance !== undefined){
            this.name = instance.name;
            this.notes = instance.notes;
            this.projects = instance.projects;
        }
    }

    /**
    * return a Donor after formatting its properties
    */
    getMapper(selfinstance): Object {
        if(!selfinstance)
            return selfinstance;
    
        return {
            name : selfinstance.name,
            notes : selfinstance.notes,
            projects : selfinstance.projects
        }
    }

    /**
    * return a Donor after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object{
        if(!selfinstance)
            return selfinstance;

        return {
            name : selfinstance.name,
            notes : selfinstance.notes,
            projects : selfinstance.projects
        } 
    }

    /**
    * return the type of Donor properties
    */
    getTypeProperties(selfinstance): Object{
        return {
            name : "text",
            fullname : "text",
            shortname : "text",
            notes : "text",
            projects : "text"
        }
    }

    /**
    * return Donor properties name displayed
    */
    static translator(): Object {
        return {
            name: "Donor",
            notes:"Notes",
            projects: "Projects",
        }
    }

    public static formatArray(instance): Donor[]{
        let donors : Donor[] = [];
        instance.forEach(element => {
            donors.push(this.formatDonor(element));
        });
        return donors;
    }

    public static formatDonor(element: any): Donor{
        let donor = new Donor();
        donor.name = element.fullname;
        if(element.shortname)
            donor.name += " "+element.shortname;
        donor.notes = element.notes;
        element.projects.forEach(element => {
            donor.projects = " "+element+" ";
        });
        return donor;
    }
}