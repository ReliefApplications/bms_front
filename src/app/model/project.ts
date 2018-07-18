import { Sector                                                                 } from "./sector"
import { SectorMapper                                                           } from "./sector-mapper";
import { Donor                                                                  } from "./donor";

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

    constructor(instance?) {
        if (instance !== undefined) {
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
        if (!selfinstance)
            return selfinstance;

        return {
            id: selfinstance.id,
            name: selfinstance.name,
            start_date: selfinstance.start_date,
            end_date: selfinstance.end_date,
            number_of_households: selfinstance.number_of_households,
            iso3: selfinstance.iso3,
            notes: selfinstance.notes,
            value: selfinstance.value,
        }
    }

    /**
    * return a Project after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            sectors_name: SectorMapper.mapSectors(selfinstance.sectors_name),
            start_date: selfinstance.start_date,
            end_date: selfinstance.end_date,
            number_of_households: selfinstance.number_of_households,
            donors_name: selfinstance.donors_name
        }
    }

    /**
    * return a Project after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            name: selfinstance.name,
            sectors_name: SectorMapper.mapSectors(selfinstance.sectors_name),
            start_date: selfinstance.start_date,
            end_date: selfinstance.end_date,
            number_of_households: selfinstance.number_of_households,
            donors_name: selfinstance.donors_name
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
            sectors_name: SectorMapper.mapSectors(selfinstance.sectors_name),
            start_date: selfinstance.start_date,
            end_date: selfinstance.end_date,
            donors_name: selfinstance.donors_name,
            notes: selfinstance.notes
        }
    }

    /**
    * return the type of Project properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            name: "text",
            sectors_name: "image",
            start_date: "date",
            end_date: "date",
            number_of_households: "number",
            donors_name: "text",
        }
    }

    /**
    * return the type of Project properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            name: "text",
            sectors_name: "select",
            start_date: "date",
            end_date: "date",
            number_of_households: "number",
            donors_name: "select",
        }
    }

    /**
    * return Project properties name displayed
    */
    static translator(): Object {
        return {
            name: "Project's name",
            sectors_name: "Sectors",
            start_date: "Start Date",
            end_date: "End Date",
            number_of_households: "Number of Households",
            donors_name: "Donors",
            notes: "Notes",
        }
    }

    public static formatArray(instance): Project[] {
        let projects: Project[] = [];
        instance.forEach(element => {
            projects.push(this.formatProject(element));
        });
        return projects;
    }

    public static formatProject(element: any): Project {
        let project = new Project(element);
        element.sectors.forEach(sector => {
            project.sectors.push(new Sector(sector));
            project.sectors_name.push(sector.name);
        });
        element.donors.forEach(donor => {
            project.donors.push(new Donor(donor));
            project.donors_name.push(donor.name);
        });
        return project;
    }

    public static formatForApi(element: Project): any {
        let project = new Project(element);
        if (element.sectors_name) {
            element.sectors_name.forEach(sector => {
                let newSector = new Sector();
                newSector.id = parseInt(sector, 10);
                project.sectors.push(new Sector(newSector));
            });
        } else {
            project.sectors = [];
        }
        if (element.donors_name) {
            element.donors_name.forEach(donor => {
                let newDonor = new Donor();
                newDonor.id = parseInt(donor, 10);
                project.donors.push(new Donor(newDonor));
            });
        } else {
            project.donors = [];
        }
        return project;
    }
}