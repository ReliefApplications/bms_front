import { Project             } from "./project"
import { Location            } from "./location"

export class DistributionData {
    static __classname__ = 'DistributionData';
    /**
     * DistributionData's name
     * @type {string}
     */
    name: string = '';
    /**
     * DistributionData's project
     * @type {Project}
     */
    project: Project;
    /**
     * DistributionData's location
     * @type {Location}
     */
    location: Location;
    /**
     * DistributionData's numberBeneficiaries
     * @type {Int16Array}
     */
    numberBeneficiaries: Int16Array;

    constructor(instance){
        if(instance !== undefined){
            this.name = instance.name;
            this.project = Object.assign({},instance.project);
            this.location = Object.assign({},instance.location);
            this.numberBeneficiaries = instance.numberBeneficiaries;
        }
    }

    getMapper(selfinstance) {
        let allSector="";
        let project = selfinstance.project;
        if(project && project.sector)
            allSector = project.sector;
        return {
            name: selfinstance.name,
            location: selfinstance.location,
            numberBeneficiaries: selfinstance.numberBeneficiaries,
            sector: allSector,
        }
    }

    static translator() {
        return {
            name: "Distribution",
            location:"Location",
            numberBeneficiaries:"n° Beneficiaries",
            sector: "Sector",
            project:"Project",
        }
    }
}