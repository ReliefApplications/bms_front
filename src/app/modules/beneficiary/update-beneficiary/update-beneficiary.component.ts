import { Component, OnInit } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { Router, ActivatedRoute } from '@angular/router';
import { HouseholdsService } from '../../../core/api/households.service';
import { ProjectService } from '../../../core/api/project.service';
import { LocationService } from '../../../core/api/location.service';
import { CriteriaService } from '../../../core/api/criteria.service';
import { CountrySpecificService } from '../../../core/api/country-specific.service';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { CacheService } from '../../../core/storage/cache.service';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { LIVELIHOOD } from '../../../model/livelihood';
import { Location } from '../../../model/location';
import { Project } from '../../../model/project';
import { VulnerabilityCriteria } from '../../../model/vulnerability_criteria';
import { CountrySpecific } from '../../../model/country-specific';

@Component({
    selector: 'app-update-beneficiary',
    templateUrl: './update-beneficiary.component.html',
    styleUrls: ['./update-beneficiary.component.scss']
})
export class UpdateBeneficiaryComponent implements OnInit {

    // Translate
    public Text = GlobalText.TEXTS;

    // Household objects
    public originalHousehold: any;
    public updatedHousehold: any;

    // Lists
    public provinceList = [];
    public districtList = [];
    public communeList = [];
    public villageList = [];
    public livelihoodsList: string[];
    public vulnerabilityList = [];
    public projectList = [];
    public countrySpecificsList = [];

    constructor(
        public router: ActivatedRoute,
        public _projectService: ProjectService,
        public _locationService: LocationService,
        public _criteriaService: CriteriaService,
        public _countrySpecificsService: CountrySpecificService,
        public _cacheService: CacheService,
        public _householdsService: HouseholdsService,
        public _beneficiariesService: BeneficiariesService,
        public formBuilder: FormBuilder,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
    ) { }

    ngOnInit() {

        this.livelihoodsList = LIVELIHOOD;

        this.initiateHousehold();
    }

    initiateHousehold() {
        this.getVulnerabilityCriteria();
        this.getProvince();

        this.router.params.subscribe(
            result => {
                if (result['id']) {
                    this._householdsService.getOne(result['id']).subscribe(
                        result => {
                            this.originalHousehold = result;
                            console.log("Household from Back : ", this.originalHousehold);

                            this.formatHouseholdForForm();
                        }
                    );
                }
            }
        );
    }

    /**
     * Transforms an instance of backend beneficiary in a formated Household readable for the inputs.
     */
    formatHouseholdForForm() {

        // Format of a household for Form
        this.updatedHousehold = {
            id: 0,
            address_number: '',
            address_postcode: '',
            address_street: '',
            beneficiaries: [],
            countrySpecifics: [{}],
            livelihood: '',
            location: {
                adm1: '',
                adm2: '',
                adm3: '',
                adm4: '',
            },
            notes: '',
            projects: []
        }

        // Id & address & livelihood & notes.
        this.updatedHousehold.id = this.originalHousehold.id;
        this.updatedHousehold.address_number = this.originalHousehold.address_number;
        this.updatedHousehold.address_postcode = this.originalHousehold.address_postcode;
        this.updatedHousehold.address_street = this.originalHousehold.address_street;
        this.updatedHousehold.notes = this.originalHousehold.notes;
        this.updatedHousehold.livelihood = this.livelihoodsList[this.originalHousehold.livelihood];

        // Projects.
        this.updatedHousehold.projects = [];
        this.originalHousehold.projects.forEach(
            element => {
                this.updatedHousehold.projects.push('' + element.id + ' - ' + element.name);
            }
        )

        // Location.
        let location = Location.formatAdmFromApi(this.originalHousehold.location);
        this.updatedHousehold.location.adm1 = Location.formatOneAdm(location.adm1);
        this.getProvince();
        this.getDistrict(String(location.adm1.id));

        if (location.adm2) {
            this.updatedHousehold.location.adm2 = Location.formatOneAdm(location.adm2);
            this.getCommune(String(location.adm2.id));
        }
        if (location.adm3) {
            this.updatedHousehold.location.adm3 = Location.formatOneAdm(location.adm3);
            this.getVillage(String(location.adm3.id));
        }
        if (location.adm4) {
            this.updatedHousehold.location.adm4 = Location.formatOneAdm(location.adm4);
        }

        // Beneficiaries.

        this.originalHousehold.beneficiaries.forEach(
            beneficiary => {
                // Head.
                if (beneficiary.status === true) {
                    this.updatedHousehold.beneficiaries.unshift(this.pushBeneficiary(beneficiary));
                }
                // Member. 
                else {
                    this.updatedHousehold.beneficiaries.push(this.pushBeneficiary(beneficiary));
                }
            }
        )
        console.log('Household for input : ', this.updatedHousehold);
    }

    /**
     * Returns a formated Beneficiary readable for the inputs from an instance of backend beneficiary.
     * @param beneficiary 
     */
    pushBeneficiary(beneficiary: any) {
        
        // Format of a beneficiary for Form
        let formatedBeneficiary = {
            id: '',
            birth_date: '',
            family_name: '',
            given_name: '',
            national_id: {
                number: '',
                type: ''
            },
            phone: {
                number: '',
                type: ''
            },
            vulnerabilities: []
        };

        formatedBeneficiary.id = beneficiary.id;
        formatedBeneficiary.birth_date = beneficiary.date_of_birth;
        formatedBeneficiary.family_name = beneficiary.family_name;
        formatedBeneficiary.given_name = beneficiary.given_name;

        if (beneficiary.national_ids[0]) {
            formatedBeneficiary.national_id.number = beneficiary.national_ids[0].id_number;
            formatedBeneficiary.national_id.type = beneficiary.national_ids[0].type;
        }
        if (beneficiary.phones[0]) {
            formatedBeneficiary.phone.number = beneficiary.phones[0].id_number;
            formatedBeneficiary.phone.type = beneficiary.phones[0].type;
        }
        if (beneficiary.vulnerability_criteria) {
            this.vulnerabilityList.forEach(
                element => {
                    formatedBeneficiary.vulnerabilities.push(false);
                    beneficiary.vulnerability_criteria.forEach(
                        vulnerability => {
                            if (element.field_string === vulnerability.field_string) {
                                formatedBeneficiary.vulnerabilities[this.vulnerabilityList.indexOf(element)] = true;
                            }
                        });
                });
        }
        return(formatedBeneficiary);
    }

    // TODO : reverse ?
    formatHouseholdForApi() {

    }

    pullBeneficiary() {

    }

    test() { }

    /**
     * Get list of all project and put it in the project selector
     */
    getProjects() {
        this._projectService.get().subscribe(response => {
            const responseProject = Project.formatArray(response);
            responseProject.forEach(element => {
                const concat = element.id + ' - ' + element.name;
                this.projectList.push(concat);
            });
        });
    }

    /**
     * Get list of all Province (adm1) and put it in the province selector
     */
    getProvince() {
        this.provinceList = [];
        this.districtList = [];
        this.communeList = [];
        this.villageList = [];
        this._locationService.getAdm1().subscribe(response => {
            const responseAdm1 = Location.formatAdm(response);
            responseAdm1.forEach(element => {
                this.provinceList.push(element);
            });
        });
    }

    /**
     * Get list of all District (adm2) and put it in the district selector
     */
    getDistrict(adm1: string) {
        this.districtList = [];
        this.communeList = [];
        this.villageList = [];
        const body = {};
        body['adm1'] = adm1;
        this._locationService.getAdm2(body).subscribe(response => {
            const responseAdm2 = Location.formatAdm(response);
            responseAdm2.forEach(element => {
                this.districtList.push(element);
            });
        });
    }

    /**
     * Get list of all Commune (adm3) and put it in the commune selector
     */
    getCommune(adm2: string) {
        this.communeList = [];
        this.villageList = [];
        const body = {};
        body['adm2'] = adm2;
        this._locationService.getAdm3(body).subscribe(response => {
            const responseAdm3 = Location.formatAdm(response);
            responseAdm3.forEach(element => {
                this.communeList.push(element);
            });
        });
    }

    /**
     * Get list of all Vilage (adm4) and put it in the village selector
     */
    getVillage(adm3: string) {
        this.villageList = [];
        const body = {};
        body['adm3'] = adm3;
        this._locationService.getAdm4(body).subscribe(response => {
            const responseAdm4 = Location.formatAdm(response);
            responseAdm4.forEach(element => {
                this.villageList.push(element);
            });
        });
    }

    /**
     * Get list of all Vulnerabilities
     */
    getVulnerabilityCriteria() {
        const promise = this._criteriaService.getVulnerabilityCriteria();
        if (promise) {
            promise.toPromise().then(response => {
                const responseCriteria = VulnerabilityCriteria.formatArray(response);
                responseCriteria.forEach(element => {
                    this.vulnerabilityList.push(element);
                });
            });
        }
    }

    /**
     * Get list of field and type of all country specifics
     */
    getCountrySpecifics() {
        const promise = this._countrySpecificsService.get();
        if (promise) {
            promise.toPromise().then(response => {
                const responseCountrySpecifics = CountrySpecific.formatArray(response);
                responseCountrySpecifics.forEach(element => {
                    this.countrySpecificsList.push(element);
                });
            });
        }
    }

}
