import { Component, OnInit, OnChanges, DoCheck } from '@angular/core';
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
import { Criteria } from '../../../model/criteria';
import { CountrySpecific } from '../../../model/country-specific';
import { startWith, map } from 'rxjs/operators';
import { StaticInjector } from '@angular/core/src/di/injector';

@Component({
    selector: 'app-update-beneficiary',
    templateUrl: './update-beneficiary.component.html',
    styleUrls: ['./update-beneficiary.component.scss']
})
export class UpdateBeneficiaryComponent implements OnInit, DoCheck {

    // Mode
    public mode : string;

    // Test var
    public changedBeneficiary;

    // Translate
    public Text = GlobalText.TEXTS;

    // Household objects
    public originalHousehold: any;
    public updatedHousehold: any;

    // DB Lists
    public provinceList = [];
    public districtList = [];
    public communeList = [];
    public villageList = [];
    public livelihoodsList: string[];
    public vulnerabilityList = [];
    public projectList = [];
    public countrySpecificsList = [];

    // Constant lists
    public genderList: string[] = ['F', 'M'];
    public typePhoneList: string[] = ['mobile', 'landline'];
    public typeNationalIdList: string[] = ['type1', 'card'];

    // Table
    public tableColumns: string[] = ['Given name', 'Family name', 'Gender', 'Birth date', 'Phone', 'National id']

    constructor(
        public route: ActivatedRoute,
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
        public router: Router,
    ) { }

    ngOnInit() {
        // Set right mode (update or create)
        if(this.router.url.split('/')[2] === 'update-beneficiary') {
            this.mode = 'update';
        } else {
            this.mode = 'create';
        }

        // Get lists
        this.livelihoodsList = LIVELIHOOD;
        this.getVulnerabilityCriteria();
        this.getProvince();
        this.getProjects();

        // Prefill
        this.initiateHousehold();
    }

    // For tests
    ngDoCheck() {
        if(this.changedBeneficiary !== Object.values(this.updatedHousehold)) {
            console.log('HH : ', this.updatedHousehold);
            this.changedBeneficiary = Object.values( this.updatedHousehold ); 
        }
    }

    /**
     * Gets household from backend and loads the method that will fill our 'updatedHousehold' attribute for input display and update.
     */
    initiateHousehold() {

        this.updatedHousehold = {
        // First set the format of a Household for Input Forms
            id: 0,
            address_number: '',
            address_postcode: '',
            address_street: '',
            livelihood: '',
            notes: '',
            beneficiaries: [],
            projects: [],
            specificAnswers: [],
            location: {
                adm1: '',
                adm2: '',
                adm3: '',
                adm4: '',
            },
        }
        
        // Set the Head if the user is creating
        if(this.mode === 'create') {
            this.updatedHousehold.beneficiaries.unshift(this.pushBeneficiary());
        }

        // Get the selected household if the user is updating
        if(this.mode === 'update') {
            this.route.params.subscribe(
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
    }

    /**
     * Transforms an instance of backend beneficiary in a formated Household readable for the inputs.
     */
    formatHouseholdForForm() {

        // Id & address & livelihood & notes.
        this.updatedHousehold.id = this.originalHousehold.id;
        this.updatedHousehold.address_number = this.originalHousehold.address_number;
        this.updatedHousehold.address_postcode = this.originalHousehold.address_postcode;
        this.updatedHousehold.address_street = this.originalHousehold.address_street;
        this.updatedHousehold.notes = this.originalHousehold.notes;
        this.updatedHousehold.livelihood = this.livelihoodsList[this.originalHousehold.livelihood];

        // CountrySpecifics
        if(this.originalHousehold.country_specific_answers) {
            this.originalHousehold.country_specific_answers.forEach(
                element => {
                    this.updatedHousehold.specificAnswers.push(
                        {
                            // Country Specific format for Form
                            answer : element.answer,
                            countryIso3 : element.country_specific.country_iso3,
                            field_string : element.country_specific.field_string,
                            id : element.country_specific.id,
                            type : element.country_specific.type
                        }
                    )
                }
            )
        }

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

        if (location.adm1) {
            this.getDistrict(String(location.adm1.id));
        }
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
        );
    }

    /**
     * Returns a formated Beneficiary readable for the inputs from an instance of backend beneficiary.
     * @param beneficiary 
     */
    pushBeneficiary(beneficiary?: any) {

        let formatedBeneficiary = {
            // Format of a beneficiary for Form
            id: '',
            birth_date: '',
            family_name: '',
            given_name: '',
            gender: '',
            national_id: {
                number: '',
                type: 'card'
            },
            phone: {
                number: '',
                type: 'mobile'
            },
            vulnerabilities: []
        };

        if (beneficiary) {
            formatedBeneficiary.id = beneficiary.id;
            formatedBeneficiary.birth_date = beneficiary.date_of_birth;
            formatedBeneficiary.family_name = beneficiary.family_name;
            formatedBeneficiary.given_name = beneficiary.given_name;

            if (beneficiary.gender == 0) {
                formatedBeneficiary.gender = 'F';
            } else if (beneficiary.gender == 1) {
                formatedBeneficiary.gender = 'M';
            }
        }

        if (beneficiary && beneficiary.national_ids[0]) {
            formatedBeneficiary.national_id.number = beneficiary.national_ids[0].id_number;
            formatedBeneficiary.national_id.type = beneficiary.national_ids[0].type;
        }

        if (beneficiary && beneficiary.phones[0]) {
            formatedBeneficiary.phone.number = beneficiary.phones[0].id_number;
            formatedBeneficiary.phone.type = beneficiary.phones[0].type;
        }

        this.vulnerabilityList.forEach(
            element => {
                formatedBeneficiary.vulnerabilities.push(false);
                if (beneficiary && beneficiary.vulnerability_criteria) {
                    beneficiary.vulnerability_criteria.forEach(
                        vulnerability => {
                            if (element.field_string === vulnerability.field_string) {
                                formatedBeneficiary.vulnerabilities[this.vulnerabilityList.indexOf(element)] = true;
                            }
                        });
                }
            });
        
        return (formatedBeneficiary);
    }

    /**
     * To delete a beneficiary from the actual household.
     * @param index 
     */
    removeBeneficiary(index: number) {
        if(index < this.updatedHousehold.beneficiaries.length) {
            this.updatedHousehold.beneficiaries.splice(index, 1);
        }
    }

    // TODO : reverse ?
    formatHouseholdForApi() {

        let finalHousehold = this.updatedHousehold;
        let finalBeneficiaries = this.updatedHousehold.beneficiaries;
        let dataHousehold;

        dataHousehold = {
            address_number: '',
            address_postcode: '',
            address_street: '',
            beneficiaries: [],
            country_specific_answers: [],
            id: 0,
            latitude: '0',
            livelihood: '',
            location: {},
            longitude: '0',
            notes: '',
            projects: [],
        }

        if(finalHousehold.address_number && finalHousehold.address_postcode && finalHousehold.address_street
            && finalBeneficiaries[0] && finalBeneficiaries[0].family_name && finalBeneficiaries[0].given_name
            && finalBeneficiaries[0].gender && finalHousehold.projects && finalHousehold.location.adm1) {
            // Format & Go
            
            dataHousehold.address_number = finalHousehold.address_number;
            dataHousehold.address_postcode = finalHousehold.address_postcode;
            dataHousehold.address_street = finalHousehold.address_street;
            dataHousehold.id = finalHousehold.id;
            dataHousehold.livelihood = this.livelihoodsList.indexOf(finalHousehold.livelihood);
            dataHousehold.notes = finalHousehold.notes;
            
            // Beneficiaries
            finalBeneficiaries.forEach(
                element => {
                    let beneficiary = {
                        date_of_birth: '',
                        family_name: '',
                        gender: 0,
                        given_name: '',
                        id: '',
                        national_ids: [],
                        phones: [],
                        profile: {},
                        status: false,
                        updated_on: new Date(),
                        vulnerability_criteria: [],
                    }
                    beneficiary.date_of_birth = element.birth_date;
                    beneficiary.family_name = element.family_name;
                    
                    if(element.gender === 'F') {
                        beneficiary.gender = 0;
                    } else if(element.gender === 'M') {
                        beneficiary.gender = 1;
                    }

                    beneficiary.given_name = element.given_name;
                    beneficiary.id = element.id;

                    if(finalBeneficiaries.indexOf(element) === 0) {
                        beneficiary.status = true;
                    } else {
                        beneficiary.status = false;
                    }

                    if(element.national_id.number)
                    beneficiary.national_ids.push(
                        {
                            id: undefined,
                            id_number: element.national_id.number,
                            type_number: element.national_id.type,
                        }
                    )
                    if(element.phone.number)
                    beneficiary.phones.push(
                        {
                            id: undefined,
                            number: element.phone.number,
                            type: element.phone.type,
                        }
                    )
                    this.originalHousehold.beneficiaries.forEach(
                        element => {
                            if(element.id === beneficiary.id) {
                                beneficiary.profile = element.profile;
                            }
                        }
                    )

                    element.vulnerabilities.forEach(
                        vulnerability => {
                            if(vulnerability === true) {
                                let criteriaIndex = element.vulnerabilities.indexOf(vulnerability);
                                beneficiary.vulnerability_criteria.push(
                                    {
                                        id: this.vulnerabilityList[criteriaIndex].id_field,
                                        field_string: this.vulnerabilityList[criteriaIndex].field_string,
                                    }
                                );
                            }
                        }
                    );
                    dataHousehold.beneficiaries.push(beneficiary);
                }
            );

            // Location


            console.log('Household for Api: ', dataHousehold);
        }
        else {
            // Minimum data not filled -> Error !
            this.snackBar.open('Minimum required data is not complete : please check previous steps', '', {duration: 3000, horizontalPosition: 'center' });
        }
        
    }

    pullBeneficiary() {

    }

    test() { }

    /**
     * Creates a string to display the full location
     */
    getFullLocation() {
        let fullLocation : string;
        let actualLocation = this.updatedHousehold.location;

        if(actualLocation.adm1) {
            fullLocation = actualLocation.adm1.split('-')[1];
        }
        if(actualLocation.adm2) {
            fullLocation += ', ' + actualLocation.adm2.split('-')[1];
        }
        if(actualLocation.adm3) {
            fullLocation += ', ' + actualLocation.adm3.split('-')[1];
        }
        if(actualLocation.adm4) {
            fullLocation += ', ' + actualLocation.adm4.split('-')[1];
        }
        return(fullLocation);
    }

    /**
     * Filter a list according to what the user types (needs formControl)
     */
    filter(value: string, element: any) {
        const filterValue = value.toLowerCase();
        // console.log(element.filter(option => option.toLowerCase().includes(filterValue)))
        return element.filter(option => option.toLowerCase().includes(filterValue));
    }

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
                const responseCriteria = Criteria.formatArray(response);
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
