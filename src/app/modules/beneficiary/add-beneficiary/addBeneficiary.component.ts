import { Component, OnInit, HostListener, ViewChild, ViewChildren, asNativeElements, QueryList } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FormControl, Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { Location } from '../../../model/location';
import { LocationService } from '../../../core/api/location.service';
import { MatInput, MatSnackBar, MatStepper, getMatFormFieldPlaceholderConflictError, MatDialog } from '@angular/material';
import { CriteriaService } from '../../../core/api/criteria.service';
import { VulnerabilityCriteria } from '../../../model/vulnerability_criteria';
import { CountrySpecificService } from '../../../core/api/country-specific.service';
import { CountrySpecific, CountrySpecificAnswer } from '../../../model/country-specific';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HouseholdsService } from '../../../core/api/households.service';
import { AddHouseholds, AddBeneficiaries, Phones, NationalID } from '../../../model/add-household';
import { Profile } from 'selenium-webdriver/firefox';
import { LIVELIHOOD } from '../../../model/livelihood';
import { DesactivationGuarded } from '../../../core/guards/deactivate.guard';
import { ModalLeaveComponent } from '../../../components/modals/modal-leave/modal-leave.component';
import { CacheService } from '../../../core/storage/cache.service';
import { Households } from '../../../model/households';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';

// DELETE MODIFICATIONS FOR UPDATE : GO BACK TO OLD ADD COMPONENT

@Component({
    selector: 'add-beneficiary',
    templateUrl: './addBeneficiary.component.html',
    styleUrls: ['./addBeneficiary.component.scss']
})
export class AddBeneficiaryComponent implements OnInit, DesactivationGuarded {
    public cc = 'lact';
    public nameComponent = 'add_beneficiary_title';
    public household = GlobalText.TEXTS;

    @ViewChild('stepper') stepper: MatStepper;
    @ViewChildren('countrySpecificsAnswer') CountrySpecificsInput: QueryList<MatInput>;
    selectedIdPoor = false;
    loadingCreation = false;

    // Household Mode ? 'add' or 'update'
    public mode = 'add';

    // for the project selector
    public projects = new FormControl('', Validators.required);
    public projectList: string[] = [];
    public selectedProjects: string[] = null;

    // for the gender selector
    public genderList: string[] = ['F', 'M'];
    public selectedGender: string = null;

    // for the province selector
    public province = new FormControl('', Validators.required);
    public provinceList: string[] = [];
    public selectedProvince: string = null;

    // for the district selector
    public district = new FormControl();
    public districtList: string[] = [];
    public selectedDistrict: string = null;

    // for the commune selector
    public commune = new FormControl();
    public communeList: string[] = [];
    public selectedCommune: string = null;

    // for the village selector
    public village = new FormControl();
    public villageList: string[] = [];
    public selectedVillage: string = null;

    // notes ?
    public notes = new FormControl();

    // for the type phone selector
    public typePhoneList: string[] = ['mobile', 'landline'];
    public selectedtypePhone = '';

    // for the type national id selector
    public typeNationalIdList: string[] = ['type1', 'card'];
    public selectedtypeNationalId = '';

    // for other item which need to display with database information
    public allVulnerability = [];
    public countrySpecifics = [];
    public answerCountrySpecific;

    // update vulnerabilities
    public updatedVulnerabilities = [];

    // for the address' input
    public addressNumber = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
    public addressStreet = new FormControl('', [Validators.pattern('[a-zA-Z ]*'), Validators.required]);
    public addressPostcode = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
    public selectedVulnerabilities = [];

    // Phone number lib
    private CodesMethods = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    private getCountryISO2 = require("country-iso-3-to-2");
    public countryCodesList = [];
    public filteredCountryCodesList: Observable<any[]>;

    // This object will be fill and send to the back when button create is click
    public householdToCreate: AddHouseholds = new AddHouseholds;

    // For the reactive form in step 2
    public headForm: FormGroup;
    // For the reactive form in step 3
    public beneficiaryForm: FormGroup;

    public id_head = 0;
    public id_beneficiary = 0;

    // List of livelihoods
    public livelihoodList = LIVELIHOOD;
    public filteredLivelihoodList: Observable<any[]>;
    public livelihoods = new FormControl();

    // Update a Beneficiary mode ?
    public updatedBeneficiary : any;

    constructor(
        public _projectService: ProjectService,
        public _locationService: LocationService,
        public snackBar: MatSnackBar,
        public _criteriaService: CriteriaService,
        public _countrySpecificsService: CountrySpecificService,
        public router: Router,
        public formBuilder: FormBuilder,
        public dialog: MatDialog,
        public _cacheService: CacheService,
        public _householdsService: HouseholdsService,
        public _beneficiariesService: BeneficiariesService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        if(this.router.url.split('/')[2] === 'update-beneficiary')
            this.mode = 'update';
        
        console.log(this.selectedVulnerabilities);
        
        this.getProjects();
        this.getProvince();
        this.getVulnerabilityCriteria();
        this.getCountrySpecifics();
        this.instantiateFormHead();
        this.initiateCountryCodes();

        // console.log(this.headForm);
        this.getUserPhoneCode();
        // Filter livelihood list
        this.filteredLivelihoodList = this.livelihoods.valueChanges.pipe(
            startWith(''),
            map(value => this.filter(value, this.livelihoodList))
        );
        // Filter countryCode list
        this.filteredCountryCodesList = this.headForm.valueChanges.pipe(
            startWith(''),
            map(value => this.filter(value.head ? String(value.head[0].countryCode) : '', this.countryCodesList))
        );

        if(this.mode==='update') {
            this.getUpdatedBeneficiary();
        }

        
    }

    /**
     * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
     */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.householdToCreate && !this.loadingCreation) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return (true);
        }

    }

    getUpdatedBeneficiary() {
        this.route.params.subscribe(
            result => {
                if(result['id']) {
                    this._householdsService.getOne(result['id']).subscribe(
                        result => {
                            this.updatedBeneficiary = result;
                            console.log("Beneficiary to update -- ", this.updatedBeneficiary);
                            this.prefillData();
                        }
                    );
                }
            }
        );
    }

    prefillData() {

        // Prefill Adress fields
        this.addressNumber.setValue(this.updatedBeneficiary.address_number);
        this.addressStreet.setValue(this.updatedBeneficiary.address_street);
        this.addressPostcode.setValue(this.updatedBeneficiary.address_postcode);
        this.livelihoods.setValue(this.livelihoodList[this.updatedBeneficiary.livelihood]);
        this.notes.setValue(this.updatedBeneficiary.notes);
        
        // Prefill Location fields
        let location = Location.formatAdmFromApi(this.updatedBeneficiary.location);
        
        this.getProvince();
        this.province.setValue(Location.formatOneAdm(location.adm1)) 
        this.selectedProvince = Location.formatOneAdm(location.adm1);
        this.getDistrict(String(location.adm1.id));

        if(location.adm2) {
            this.district.setValue(Location.formatOneAdm(location.adm2));
            this.selectedDistrict = Location.formatOneAdm(location.adm2);
            this.getCommune(String(location.adm2.id));
        }
        if(location.adm3) {
            this.commune.setValue(Location.formatOneAdm(location.adm3));
            this.selectedCommune = Location.formatOneAdm(location.adm3);
            this.getVillage(String(location.adm3.id));
        }
        if(location.adm4) {
            this.village.setValue(Location.formatOneAdm(location.adm4));
            this.selectedVillage = Location.formatOneAdm(location.adm4);
        }

        // Prefill Project field
        let projects = this.updatedBeneficiary.projects;
        projects.forEach(
            element => {
                projects[projects.indexOf(element)] = '' + element.id + ' - ' + element.name;
            }
        )
        this.projects.setValue(projects);
        this.selectedProjects = projects;

        // Beneficiaries Head & Members
        let head;
        let headIndex = 0;
        let members = [];
        this.updatedBeneficiary.beneficiaries.forEach(
            beneficiary => {
                if (beneficiary.status) {
                    head = beneficiary;
                    headIndex = this.updatedBeneficiary.beneficiaries.indexOf(beneficiary);
                } else {
                    members.push(beneficiary);
                }
            }
        )
        console.log('members: ', members);

        // Prefill Head
        if(head.gender === 0) {
            head.gender = 'F';
        } else if (head.gender === 1) {
            head.gender = 'M';
        }
        if(head.phones[0]) {
            head.phones = {
                number: head.phones[0].number,
                type: head.phones[0].type
            }
        } else {
            head.phones = {
                number: '',
                type: ''
            }
        }
        if(head.national_ids[0]) {
            head.national_ids = {
                number: head.national_ids[0].id_number,
                type: head.national_ids[0].id_type
            }
        } else {
            head.national_ids = {
                number: '',
                type: ''
            }
        }

        this.instantiateFormHead(head);

        if(head.vulnerability_criteria) {
            this.updatedVulnerabilities.push(this.allVulnerability);
            
            head.vulnerability_criteria.forEach(
                element => {
                    this.choiceVulnerabilities(VulnerabilityCriteria.formatElement(element), headIndex, 'head');
                    this.updatedVulnerabilities[0].forEach(
                        criteria => {
                            if(criteria.field_string === element.field_string) {
                                this.updatedVulnerabilities[0][this.updatedVulnerabilities[0].indexOf(criteria)].checked = true;
                            } else {
                                this.updatedVulnerabilities[0][this.updatedVulnerabilities[0].indexOf(criteria)].checked = false;
                            }
                        }
                    );
                }
            );
        }

        // Prefill Members.
        // first member index is after head (0) in updatedVulnerability array.
        let memberIndexInHousehold = 0;
        members.forEach(
            element => {
                let member = element;
                
                if(memberIndexInHousehold === headIndex) {
                    memberIndexInHousehold++;
                }

                if(member.gender === 0) {
                    member.gender = 'F';
                } else if (member.gender === 1) {
                    member.gender = 'M';
                }
                if(member.phones[0]) {
                    member.phones = {
                        number: member.phones[0].number,
                        type: member.phones[0].type
                    }
                } else {
                    member.phones = {
                        number: '',
                        type: ''
                    }
                }
                if(member.national_ids[0]) {
                    member.national_ids = {
                        number: member.national_ids[0].id_number,
                        type: member.national_ids[0].id_type
                    }
                } else {
                    member.national_ids = {
                        number: '',
                        type: ''
                    }
                }

                members[members.indexOf(element)] = member;
                this.addMoreBeneficiary(member);

                if(member.vulnerability_criteria) {
                    this.updatedVulnerabilities.push(this.allVulnerability);
                    
                    member.vulnerability_criteria.forEach(
                        vulnerability => {
                            this.choiceVulnerabilities(VulnerabilityCriteria.formatElement(vulnerability), memberIndexInHousehold, 'member');
                            this.updatedVulnerabilities[this.updatedVulnerabilities.length-1].forEach(
                                criteria => {
                                    this.updatedVulnerabilities[this.updatedVulnerabilities.length-1]
                                    [this.updatedVulnerabilities[this.updatedVulnerabilities.length-1]
                                    .indexOf(criteria)].checked = (criteria.field_string === vulnerability.field_string);
                                }
                            );
                        }
                    );
                }
                memberIndexInHousehold++;
            }
        );

        console.log("test 2: ", this.updatedVulnerabilities);
        // TODO : instantiate for the number of members
    }

    /**
     * Filter the list of livelihoods according to waht the user types
     */
    filter(value: string, element: any) {
        let filterValue;

        if(value) {
            filterValue = value.toLowerCase();
        }
        // console.log(element.filter(option => option.toLowerCase().includes(filterValue)))
        return element.filter(option => option.toLowerCase().includes(filterValue));
    }

    initiateCountryCodes() {
        // console.log(this.CodesMethods.getSupportedRegions());
        this.countryCodesList = this.CodesMethods.getSupportedRegions();
        for (let i = 0; i < this.countryCodesList.length; i++) {
            this.countryCodesList[i] = '+' + this.CodesMethods.getCountryCodeForRegion(this.countryCodesList[i]).toString();
        }
        // console.log(this.countryCodesList);
    }

    getUserPhoneCode(): string {
        let phoneCode;

        phoneCode = this._cacheService.get(CacheService.ADM1);
        // console.log('cache:', phoneCode);

        if (phoneCode) {
            phoneCode = String(this.getCountryISO2(phoneCode[0].country_i_s_o3.toString()));
            phoneCode = '+' + this.CodesMethods.getCountryCodeForRegion(phoneCode);
            return (phoneCode);
        } else {
            return '';
        }
    }

    /**
     * Initiate the head form structure
     */
    instantiateFormHead(instance? ) {
        this.headForm = this.formBuilder.group({
            head: this.formBuilder.array([
                this.formBuilder.group({
                    id: 'head' + this.id_head,
                    familyName: [instance? instance.family_name : '', Validators.required],
                    givenName: [instance? instance.given_name : '', Validators.required],
                    gender: [instance? instance.gender : '', Validators.required],
                    birth: [instance? instance.date_of_birth : '', Validators.required],
                    typeNationalId: instance? instance.national_ids.type : '',
                    typePhone: instance? instance.phones.type : '',
                    vulnerabilities: '',
                    phone: [instance? instance.phones.number : '', Validators.pattern('[0-9]*')],
                    countryCode: this.getUserPhoneCode(),
                    nationalID: instance? instance.national_ids.number: ''
                })
            ])
        });
    }

    /**
    * Initiate the beneficiary form structure
    */
    instantiateFormBeneficiary(instance? ) {
        this.beneficiaryForm = this.formBuilder.group({
            beneficiary: this.formBuilder.array([
                this.formBuilder.group({
                    id: 'beneficiary' + this.id_beneficiary,
                    familyName: [instance? instance.family_name : '', Validators.required],
                    givenName: [instance? instance.given_name : '', Validators.required],
                    gender: [instance? instance.gender : '', Validators.required],
                    birth: [instance? instance.date_of_birth : '', Validators.required],
                    typeNationalId: instance? instance.national_ids.type : '',
                    typePhone: instance? instance.phones.type : '',
                    vulnerabilities: '',
                    phone: [instance? instance.phones.number : '', Validators.pattern('[0-9]*')],
                    countryCode: this.getUserPhoneCode(),
                    nationalID: instance? instance.national_ids.number : '',
                })
            ])
        });
        this.id_beneficiary = this.id_beneficiary + 1;
    }

    /**
     * to get beneficiary form easily in html template
     */
    get head() {
        return this.headForm.get('head') as FormArray;
    }

    /**
     * to get beneficiary form easily in html template
     */
    get beneficiary() {
        return this.beneficiaryForm.get('beneficiary') as FormArray;
    }

    /**
     * to create more than one beneficiaries
     * instantiate a nex form for beneficiary
     */
    addMoreBeneficiary(instance?) {
        console.log('inst : ',instance);
        if (this.beneficiaryForm === undefined) {
            instance? this.instantiateFormBeneficiary(instance) : this.instantiateFormBeneficiary();
        } else {
            const newBeneficiary = this.formBuilder.group({
                id: 'beneficiary' + this.id_beneficiary,
                familyName: instance? instance.family_name : '',
                givenName: instance? instance.given_name : '',
                gender: instance? instance.gender : '',
                birth: instance? instance.date_of_birth : '',
                typeNationalId: instance? instance.national_ids.type : '',
                typePhone: instance? instance.phones.type : '',
                vulnerabilities: '',
                phone: [instance? instance.phones.number : '', Validators.pattern('[0-9]*')],
                countryCode: this.getUserPhoneCode(),
                nationalID: instance? instance.national_ids.number : '',
            });
            this.beneficiary.push(newBeneficiary);
            this.id_beneficiary = this.id_beneficiary + 1;
        }

    }

    /**
     * to delete beneficiary
     * @param index
     */
    deleteBeneficiary(index) {
        this.beneficiary.removeAt(index);
    }

    /**
     * Get country specific's element in the front to get thei placeholder and their value
     */
    ngAfterViewInit() {
        this.answerCountrySpecific = this.CountrySpecificsInput;
    }

    /**
      * check if the langage has changed
      */
    ngDoCheck() {
        if (this.household !== GlobalText.TEXTS) {
            this.household = GlobalText.TEXTS;
        }
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
                const responseCriteria = VulnerabilityCriteria.formatArray(response);
                responseCriteria.forEach(element => {
                    this.allVulnerability.push(element);
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
                    this.countrySpecifics.push(element);
                });
                // console.log(this.countrySpecifics);
            });
        }

    }

    /**
     * switch in the type give in paramater
     * this function is called by the selector when the value change
     * allow to get the new value
     * @param event
     * @param type
     */
    selected(event, type: string) {
        console.log(this.headForm);
        switch (type) {
            case 'province':
                const province = event.value.split(' - ');
                this.selectedProvince = province[1];
                this.getDistrict(province[0]);
                break;
            case 'district':
                const district = event.value.split(' - ');
                this.selectedDistrict = district[1];
                this.getCommune(district[0]);
                break;
            case 'commune':
                const commune = event.value.split(' - ');
                this.selectedCommune = commune[1];
                this.getVillage(commune[0]);
                break;
            case 'village':
                const village = event.value.split(' - ');
                this.selectedVillage = village[1];
                break;
            case 'project':
                this.selectedProjects = event.value;
                break;
        }
    }

    /**
     * get the id of country specific when formating data
     * @param name
     */
    getIdCountrySpecific(name: string) {
        let idCountrySpecific;
        this.countrySpecifics.forEach(element => {
            if (element.field === name) {
                idCountrySpecific = element.id;
            }
        });

        return idCountrySpecific;
    }

    test() {
        return true;
    }

    /**
     * use to check vulnerabilites in member
     * if a vulnerability checkbox is check the value of if is add in the array
     * if a vulnerability is uncheck, the value is delete of the array
     * An unique index is created to find which beneficiaries is associate with which array
     * @param vulnerablity
     */
    choiceVulnerabilities(vulnerablity: VulnerabilityCriteria, index, type) {
        console.log("creating vulnerabilities", vulnerablity, index, type);
        
        const vulnerabilitiesByBeneficiary = {};
        vulnerabilitiesByBeneficiary['id'] = type + index;
        vulnerabilitiesByBeneficiary['vulnerabilities'] = [];
        let beneficiaryFound = false;

        if (this.selectedVulnerabilities.length === 0) {
            vulnerabilitiesByBeneficiary['vulnerabilities'].push(vulnerablity.id);
            this.selectedVulnerabilities.push(vulnerabilitiesByBeneficiary);
        } else {
            this.selectedVulnerabilities.forEach(vulnerabilityArray => {
                const id = type + index;
                if (vulnerabilityArray.id === id) {
                    let vulnerabilityFound = false;
                    beneficiaryFound = true;
                    vulnerabilityArray.vulnerabilities.forEach(element => {
                        if (element === vulnerablity.id) {
                            vulnerabilityArray.vulnerabilities.splice(vulnerabilityArray.vulnerabilities.indexOf(vulnerablity.id), 1);
                            vulnerabilityFound = true;
                        }
                    });
                    if (!vulnerabilityFound) {
                        vulnerabilityArray.vulnerabilities.push(vulnerablity.id);
                    }
                }
            });
            if (!beneficiaryFound) {
                vulnerabilitiesByBeneficiary['vulnerabilities'].push(vulnerablity.id);
                this.selectedVulnerabilities.push(vulnerabilitiesByBeneficiary);
            }
        }
    }

    /**
     * Get and put in the householdToCreate Object all data in the step 1 to create the household
     * @param addressNumber
     * @param addressStreet
     * @param addressPostcode
     * @param notes
     */
    addInformation(addressNumber: string, addressStreet: string, addressPostcode: string, notes: string, livelihood: string) {
        if (!this.addressNumber.invalid && !this.addressStreet.invalid && !this.addressPostcode.invalid && !this.province.invalid && !this.projects.invalid) {
            this.householdToCreate.notes = notes;
            this.householdToCreate.address_number = addressNumber;
            this.householdToCreate.address_street = addressStreet;
            this.householdToCreate.address_postcode = addressPostcode;
            this.householdToCreate.location.adm1 = this.selectedProvince;
            this.householdToCreate.location.adm2 = this.selectedDistrict;
            this.householdToCreate.location.adm3 = this.selectedCommune;
            this.householdToCreate.location.adm4 = this.selectedVillage;
            this.householdToCreate.livelihood = this.livelihoodList.indexOf(livelihood);
            this.answerCountrySpecific._results.forEach(result => {
                const answerCountry = new CountrySpecificAnswer;
                const idCountrySpecific = new CountrySpecific;
                answerCountry.answer = result.nativeElement.value;
                idCountrySpecific.id = this.getIdCountrySpecific(result.nativeElement.attributes[4].nodeValue);
                idCountrySpecific.field = result.nativeElement.attributes[4].nodeValue;
                answerCountry.country_specific = idCountrySpecific;
                this.householdToCreate['country_specific_answers'].push(answerCountry);
            });
            this.stepper.next();

            // this.addGeneralInformation = true;
        } else if (this.addressNumber.invalid) {
            this.snackBar.open('Invalid field : addressNumber', '', { duration: 3000, horizontalPosition: 'right' });
        } else if (this.addressStreet.invalid) {
            this.snackBar.open('Invalid field : addressStreet', '', { duration: 3000, horizontalPosition: 'right' });
        } else if (this.addressPostcode.invalid) {
            this.snackBar.open('Invalid field : addressPostcode', '', { duration: 3000, horizontalPosition: 'right' });
        } else if (this.province.invalid) {
            this.snackBar.open('Invalid field : province', '', { duration: 3000, horizontalPosition: 'right' });
        } else if (this.projects.invalid) {
            this.snackBar.open('Invalid field : projects', '', { duration: 3000, horizontalPosition: 'right' });
        } else {
            this.snackBar.open('Invalid field', '', { duration: 3000, horizontalPosition: 'right' });
        }
    }

    /**
     * function call when the user click in next button in step 2 or 3
     * the type is head or beneficiary : head for the step 2, beneficiary for the step 3
     * @param type
     */
    next(type: string = null) {
        if (type === 'head') {
            if (this.headForm.status === 'VALID') {
                this.addBeneficiaries(this.headForm.value.head, type);
                this.stepper.next();
            } else {
                this.snackBar.open('Invalid field', '', { duration: 3000, horizontalPosition: 'right' });
            }
        } else {
            if (this.beneficiaryForm !== undefined) {
                if (this.beneficiaryForm.status === 'VALID') {
                    this.addBeneficiaries(this.beneficiaryForm.value.beneficiary, type);
                    this.stepper.next();
                } else {
                    this.snackBar.open('Invalid field', '', { duration: 3000, horizontalPosition: 'right' });
                }
            } else {
                this.stepper.next();

            }

        }
    }

    /**
     * to add beneficiaries is object householdToCreate
     * check if the beneficiaries exists, if it exists, it is update directly
     * if not, it is create
     * @param inputBeneficiaries
     * @param type
     */
    addBeneficiaries(inputBeneficiaries, type: string) {
        inputBeneficiaries.forEach(inputBeneficiary => {
            let alreadyRegister = false;
            if (this.householdToCreate.beneficiaries.length === 0) {
                const newBeneficiary: AddBeneficiaries = new AddBeneficiaries;
                this.formatBeneficiaries(inputBeneficiary, type, newBeneficiary);
                this.householdToCreate.beneficiaries.push(newBeneficiary);
            } else {
                this.householdToCreate.beneficiaries.forEach(
                    householdBeneficiary => {
                        if (householdBeneficiary.id === inputBeneficiary.id) {
                            this.formatBeneficiaries(inputBeneficiary, type, householdBeneficiary);
                            alreadyRegister = true;
                        }
                    }
                );
                if (!alreadyRegister) {
                    const newBeneficiary: AddBeneficiaries = new AddBeneficiaries;
                    this.formatBeneficiaries(inputBeneficiary, type, newBeneficiary);
                    this.householdToCreate.beneficiaries.push(newBeneficiary);
                }
            }
        });
    }

    findSrcVulnerability(idVulnerability: string): string {
        let src = '';
        this.allVulnerability.forEach(vulnerability => {
            if (vulnerability.id === idVulnerability) {
                src = vulnerability.src;
            }
        });

        return src;
    }

    /**
     * use to format beneficiaries in the good format
     * @param inputBeneficiary
     * @param type
     * @param newBeneficiary
     */
    formatBeneficiaries(inputBeneficiary, type, newBeneficiary) {
        newBeneficiary.id = inputBeneficiary.id;
        newBeneficiary.family_name = inputBeneficiary.familyName;
        newBeneficiary.given_name = inputBeneficiary.givenName;
        const fieldPhone: Phones = new Phones;
        fieldPhone.number = inputBeneficiary.countryCode + inputBeneficiary.phone;
        fieldPhone.type = inputBeneficiary.typePhone;
        newBeneficiary.phones.push(fieldPhone);
        const fieldNationalID: NationalID = new NationalID;
        fieldNationalID.id_number = inputBeneficiary.nationalID;
        fieldNationalID.id_type = inputBeneficiary.typeNationalId;
        newBeneficiary.national_ids.push(fieldNationalID);

        if (inputBeneficiary.gender === 'F') {
            newBeneficiary.gender = 0;
        } else {
            newBeneficiary.gender = 1;
        }

        if (type === 'head') {
            newBeneficiary.status = '1';
        } else {
            newBeneficiary.status = '0';
        }

        const formatDateOfBirth = inputBeneficiary.birth.split('/');
        if (String(formatDateOfBirth[0]).length < 2) {
            formatDateOfBirth[0] = '0' + formatDateOfBirth[0];
        }
        if (String(formatDateOfBirth[1]).length < 2) {
            formatDateOfBirth[1] = '0' + formatDateOfBirth[1];
        }

        newBeneficiary.date_of_birth = formatDateOfBirth[2] + '-' + formatDateOfBirth[0] + '-' + formatDateOfBirth[1];

        newBeneficiary.vulnerability_criteria = [];
        this.selectedVulnerabilities.forEach(vulnerabilities => {
            if (vulnerabilities.id === inputBeneficiary.id) {
                vulnerabilities.vulnerabilities.forEach(vulnerability => {
                    const fieldVulnerability: VulnerabilityCriteria = new VulnerabilityCriteria;
                    fieldVulnerability.id = vulnerability;
                    fieldVulnerability.src = this.findSrcVulnerability(vulnerability);
                    newBeneficiary.vulnerability_criteria.push(fieldVulnerability);
                });
            }
        });
    }

    /**
     * alow to return in household page and abort the creation of household
     */
    cancel() {
        this.router.navigate(['/beneficiaries']);
    }

    /**
     * send data to the back and create the new household
     */
    create() {
        if (this.selectedProjects && this.householdToCreate.beneficiaries) {

            let projects = [];
            this.selectedProjects.forEach(
                element => {
                    projects.push(element.split(' - ')[1]);
                }
            );

            this.householdToCreate.beneficiaries.forEach(beneficiary => {
                delete beneficiary.id;
            });

            this.loadingCreation = true;
            
            const promise = this._householdsService.add2(this.householdToCreate, projects);
            if (promise) {
                promise.toPromise().then(() => {
                    this.router.navigate(['/beneficiaries']);
                    this.loadingCreation = false;
                })
                    .catch(
                        () => {
                            this.loadingCreation = false;
                            this.snackBar.open('Error while creating household', '', { duration: 3000, horizontalPosition: 'right' });
                        }
                    );
            }
        } else {
            this.snackBar.open('Missing data to create household', '', { duration: 3000, horizontalPosition: 'right' });

        }
    }

}
