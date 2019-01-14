import { GlobalText } from "../../texts/global";
import { Project } from "./project";

export class Households {
    static __classname__ = 'Households';
    /**
     * Households' id
     * @type {number}
     */
    id: number;
    /**
     * Households' familyName
     * @type {string}
     */
    familyName: string = '';
    /**
     * Households' firstName
     * @type {string}
     */
    firstName: string = '';
    /**
     * Households' location
     * @type {string}
     */
    location: string = '';
    /**
     * Households' dependents
     * @type {Number}
     */
    dependents: Number;
    /**
    * Households' vulnerabilities
    * @type {Array}
    */
    vulnerabilities: Array<string> = [];
    /**
     * Household's projects
     * @type {string}
     */
    projects: string;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.familyName = instance.familyName;
            this.firstName = instance.firstName;
            this.location = instance.location;
            this.dependents = instance.dependents;
            this.vulnerabilities = instance.vulnerabilities;
        }
    }

    public static getDisplayedName() {
        return GlobalText.TEXTS.households;
    }

    /**
    * return a Households after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        return {
            familyName: selfinstance.familyName,
            firstName: selfinstance.firstName,
            location: selfinstance.location,
            dependents: selfinstance.dependents,
            vulnerabilities: selfinstance.vulnerabilities,
            projects: selfinstance.projects,
        }
    }

    /**
    * return a Households after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance)
            return selfinstance;

        let vulnerabilityString = '';
        if (selfinstance.vulnerabilities[0]) {
            selfinstance.vulnerabilities.forEach(
                (element, index) => {
                    if (index > 0) {
                        vulnerabilityString += ', ';
                    }
                    vulnerabilityString += element.substring(25).split('.')[0];
                }
            )
        }

        return {
            familyName: selfinstance.familyName,
            firstName: selfinstance.firstName,
            location: selfinstance.location,
            dependents: selfinstance.dependents,
            vulnerabilities: vulnerabilityString,
            projects: selfinstance.projects,
        }
    }

    /**
    * return the type of Households properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            familyName: "text",
            firstName: "text",
            location: "text",
            dependents: "number",
            vulnerabilities: "png",
            projects: "text",
        }
    }

    /**
    * return Households properties name displayed
    */
    static translator(): Object {
        return {
            familyName: GlobalText.TEXTS.model_familyName,
            firstName: GlobalText.TEXTS.model_firstName,
            location: GlobalText.TEXTS.location,
            dependents: GlobalText.TEXTS.model_beneficiaries_dependents,
            vulnerabilities: GlobalText.TEXTS.model_vulnerabilities,
            projects: GlobalText.TEXTS.projects,
        }
    }

    public static mapVulnerability(name: string): string {
        if (!name) {
            return "";
        }
        switch (name) {
            case "pregnant":
                name = 'assets/images/households/pregnant.png';
                break;
            case "disabled":
                name = 'assets/images/households/disabled.png';
                break;
            case "lactating":
                name = 'assets/images/households/lactating.png';
                break;
            case "solo parent":
                name = 'assets/images/households/solo-parent.png';
                break;
            case "nutritional issues":
                name = 'assets/images/households/nutritional-issues.png';
                break;
            default: return name;
        }
        return name;
    }

    public static formatArray(instance: any): Households[] {
        let households: Households[] = [];
        if (instance)
            instance.forEach(element => {
                households.push(this.formatElement(element));
            });
        return households;
    }

    public static formatElement(element: any): Households {
        let household = new Households();
        let dependents: number;
        if (element.number_dependents == null) {
            dependents = element.beneficiaries.length;
        }
        else {
            dependents = element.number_dependents;
        } 

        let projectString = "";

        household.id = element.id;

        element.beneficiaries.forEach(beneficiary => {
            if (beneficiary.status == true) {
                household.familyName = beneficiary.family_name;
                household.firstName = beneficiary.given_name;
            }
            beneficiary.vulnerability_criteria.forEach(vulnerability => {
                household.vulnerabilities.push(this.mapVulnerability(vulnerability.field_string))
            });
        });

        element.projects.forEach(project => {
            if (projectString == "")
                projectString = project.name;
            else
                projectString = projectString + ", " + project.name;
        });
        household.projects = projectString;

        if (element.location.adm1) {
            household.location += element.location.adm1.name + " ";
        }
        if (element.location.adm2) {
            household.location += element.location.adm2.name + " ";
        }
        if (element.location.adm3) {
            household.location += element.location.adm3.name + " ";
        }
        if (element.location.adm4) {
            household.location += element.location.adm4.name + " ";
        }
        household.dependents = dependents;


        return household;
    }
}