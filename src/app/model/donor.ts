import { SectorMapper } from "./sector-mapper";
import { GlobalText } from "../../texts/global";

export class Donor {
    static __classname__ = 'Donor';
    /**
     * Donor's id
     * @type {number}
     */
    id: number;
    /**
     * Donor's fullname
     * @type {string}
     */
    fullname: string = '';
    /**
     * Donor's date_added
     * @type {Date}
     */
    date_added: Date;
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
    * Donor's projects
    * @type {string[]}
    */
    projects_name: string[] = [];

    buttonInfo: Object = {icon: "settings/donors", title: GlobalText.TEXTS.settings_donors, ref:"donors"};
    
    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.fullname = instance.fullname;
            this.shortname = instance.shortname;
            this.notes = instance.notes;
            this.date_added = instance.date_added;
        }
    }

    public static getDisplayedName(){
        return GlobalText.TEXTS.model_donor;
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            id: selfinstance.id,
            fullname: selfinstance.fullname,
            shortname: selfinstance.shortname,
            date_added: selfinstance.date_added,
            notes: selfinstance.notes,
            projects_name: selfinstance.projects_name,
        }
    }

    /**
    * return a Donor after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            fullname: selfinstance.fullname,
            shortname: selfinstance.shortname,
            notes: selfinstance.notes,
        }
    }

    /**
    * return a Donor after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            fullname: selfinstance.fullname,
            shortname: selfinstance.shortname,
            notes: selfinstance.notes,
        }
    }

    /**
    * return a Donor after formatting its properties for the modal add
    */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            fullname: selfinstance.fullname,
            shortname: selfinstance.shortname,
            notes: selfinstance.notes
        }
    }

    /**
    * return a cDonor after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            fullname: selfinstance.fullname,
            shortname: selfinstance.shortname,
            notes: selfinstance.notes,
        }
    }

    /**
    * return the type of Donor properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            fullname: "text",
            shortname: "text",
            notes: "text"
        }
    }

    /**
    * return the type of Donor properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            fullname: "text",
            shortname: "text",
            notes: "text"
        }
    }

    /**
    * return Donor properties name displayed
    */
    static translator(): Object {
        return {
            fullname: GlobalText.TEXTS.model_donor_fullname,
            shortname: GlobalText.TEXTS.model_donor_shortname,
            notes: GlobalText.TEXTS.model_notes,
            projects_name: GlobalText.TEXTS.projects,
        }
    }

    public static formatArray(instance): Donor[] {
        let donors: Donor[] = [];
        if(instance)
        instance.forEach(element => {
            donors.push(this.formatFromApi(element));
        });
        return donors;
    }

    public static formatFromApi(element: any): Donor {
        let donor = new Donor();
        donor.id = element.id;
        donor.fullname = element.fullname;
        donor.shortname = element.shortname;
        donor.notes = element.notes;
        donor.date_added = element.date_added;
        if(!element.projects) {
            element['projects'] = [];
        }
        element.projects.forEach(element => {
            donor.projects_name.push(element.name);
        });

        return donor;
    }

    public static formatForApi(element: Donor): any {
        return new Donor(element);
    }

    /**
     * used in modal add
     * @param element 
     * @param loadedData 
     */
    public static formatFromModalAdd(element: any, loadedData: any): Donor {
        let newObject = new Donor(element);
    
        return newObject;
    }
}