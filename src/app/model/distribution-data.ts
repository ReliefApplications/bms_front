import { Project             } from "./project"
import { Location            } from "./location"
import { SectorMapper        } from "./sector-mapper";

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

    constructor(instance?){
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
            allSector = project.sector.name;
        let allLocation="";
        let location = selfinstance.location;
        if(location && location.adm1){
            allLocation = location.adm1;
            if (location.adm2)
                allLocation += ", "+location.adm2;
        }
        return {
            name: selfinstance.name,
            location: allLocation,
            numberBeneficiaries: selfinstance.numberBeneficiaries,
            sector: SectorMapper.mapSector(allSector),
        }
    }

    getTypeProperties(selfinstance){
        return {
            name: "text",
            location:"text",
            numberBeneficiaries:"number",
            sector: "image",
            project:"text",
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