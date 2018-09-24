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
import { Router, NavigationEnd } from '@angular/router';
import { HouseholdsService } from '../../../core/api/households.service';
import { AddHouseholds, AddBeneficiaries, Phones, NationalID } from '../../../model/add-household';
import { Profile } from 'selenium-webdriver/firefox';
import { LIVELIHOOD } from '../../../model/livelihood';
import { DesactivationGuarded } from '../../../core/guards/deactivate.guard';
import { ModalLeaveComponent } from '../../../components/modals/modal-leave/modal-leave.component';

@Component({
    selector: 'add-beneficiary',
    templateUrl: './addBeneficiary.component.html',
    styleUrls: ['./addBeneficiary.component.scss']
})
export class AddBeneficiaryComponent implements OnInit, DesactivationGuarded {

    public nameComponent = 'add_beneficiary_title';
    public household = GlobalText.TEXTS;

    @ViewChild('stepper') stepper: MatStepper;
    @ViewChildren('countrySpecificsAnswer') CountrySpecificsInput: QueryList<MatInput>;
    selectedIdPoor = false;

    // for the project selector
    public projects = new FormControl('', Validators.required);
    public projectList: string[] = [];
    public selectedProject: string = null;

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

    // for the type phone selector
    public typePhoneList: string[] = ['mobile', 'landline'];
    public selectedtypePhone = '';

    // for the type national id selector
    public typeNationalIdList: string[] = ['type1', 'card'];
    public selectedtypeNationalId = '';

    // for other item which need to display with database information
    public allVulnerability = [];
    public countrySpecifics = [];
    public specifics = [];
    public answerCountrySpecific;
    public setIdPoor = new FormControl();

    // for the address' input
    public addressNumber = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
    public addressStreet = new FormControl('', [Validators.pattern('[a-zA-Z ]*'), Validators.required]);
    public addressPostcode = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
    public selectedVulnerabilities = [];

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

    constructor(
        public _projectService: ProjectService,
        public _locationService: LocationService,
        public snackBar: MatSnackBar,
        public _criteriaService: CriteriaService,
        public _countrySpecificsService: CountrySpecificService,
        public router: Router,
        public _householdsServce: HouseholdsService,
        public formBuilder: FormBuilder,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        this.getProjects();
        this.getProvince();
        this.getVulnerabilityCriteria();
        this.getCountrySpecifics();
        this.instantiateFormHead();

        this.specifics[0] = new FormControl();
        this.specifics[1] = new FormControl();
        this.specifics[2] = new FormControl();

        this.filteredLivelihoodList = this.livelihoods.valueChanges.pipe(
            startWith(''),
            map(value => this.filterLivelihoods(value))
        );
    }

    /**
     * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
     */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.householdToCreate) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return(true);
        }
    }

    /**
     * Filter the list of livelihoods according to waht the user types
     */
    filterLivelihoods(value: string) {
        const filterValue = value.toLowerCase();
        return this.livelihoodList.filter(option => option.toLowerCase().includes(filterValue));
    }

    /**
     * Initiate the head form structure
     */
    instantiateFormHead() {
        this.headForm = this.formBuilder.group({
            head: this.formBuilder.array([
                this.formBuilder.group({
                    id: 'head' + this.id_head,
                    familyName: ['', Validators.required],
                    givenName: ['', Validators.required],
                    gender: ['', Validators.required],
                    birth: ['', Validators.required],
                    typeNationalId: '',
                    typePhone: '',
                    vulnerabilities: '',
                    phone: '',
                    nationalID: ''
                })
            ])
        });
    }

    /**
    * Initiate the beneficiary form structure
    */
    instantiateFormBeneficiary() {
        this.beneficiaryForm = this.formBuilder.group({
            beneficiary: this.formBuilder.array([
                this.formBuilder.group({
                    id: 'beneficiary' + this.id_beneficiary,
                    familyName: ['', Validators.required],
                    givenName: ['', Validators.required],
                    gender: ['', Validators.required],
                    birth: ['', Validators.required],
                    typeNationalId: '',
                    typePhone: '',
                    vulnerabilities: '',
                    phone: '',
                    nationalID: ''
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
    addMoreBeneficiary() {
        if (this.beneficiaryForm === undefined) {
            this.instantiateFormBeneficiary();
        } else {
            const newBeneficiary = this.formBuilder.group({
                id: 'beneficiary' + this.id_beneficiary,
                familyName: '',
                givenName: '',
                gender: '',
                birth: '',
                typeNationalId: '',
                typePhone: '',
                vulnerabilities: '',
                phone: '',
                nationalID: ''
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
            const responseProject = Project.formatArray(response.json());
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
            const responseAdm1 = Location.formatAdm(response.json());
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
            const responseAdm2 = Location.formatAdm(response.json());
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
            const responseAdm3 = Location.formatAdm(response.json());
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
            const responseAdm4 = Location.formatAdm(response.json());
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
                const responseCriteria = VulnerabilityCriteria.formatArray(response.json());
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
                const responseCountrySpecifics = CountrySpecific.formatArray(response.json());
                responseCountrySpecifics.forEach(element => {
                    this.countrySpecifics.push(element);
                });
                // console.log(this.countrySpecifics);
            });
        }

    }

    /**
     * sitch in the type give in paramater
     * this function is called by the selector when the value change
     * allow to get the new value
     * @param event
     * @param type
     */
    selected(event, type: string) {
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
                this.selectedProject = event.value;
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

    /**
     * use to check vulnerabilites in member
     * if a vulnerability checkbox is check the value of if is add in the array
     * if a vulnerability is uncheck, the value is delete of the array
     * An unique index is created to find which beneficiaries is associate with which array
     * @param vulnerablity
     */
    choiceVulnerabilities(vulnerablity: VulnerabilityCriteria, index, type) {
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
                this.householdToCreate.beneficiaries.forEach(householdBeneficiary => {
                    if (householdBeneficiary.id === inputBeneficiary.id) {
                        this.formatBeneficiaries(inputBeneficiary, type, householdBeneficiary);
                        alreadyRegister = true;
                    }
                });
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
        fieldPhone.number = inputBeneficiary.phone;
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

        const formatDateOfBirth = inputBeneficiary.birth.toLocaleDateString().split('/');
        if (formatDateOfBirth[0].length < 2) {
            formatDateOfBirth[0] = '0' + formatDateOfBirth[0];
        }
        if (formatDateOfBirth[1].length < 2) {
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
        const project = this.selectedProject.split(' - ');

        this.householdToCreate.beneficiaries.forEach(beneficiary => {
            delete beneficiary.id;
        });

        const promise = this._householdsServce.add(this.householdToCreate, project[0]);
        if (promise) {
            promise.toPromise().then(() => {
                this.router.navigate(['/households']);
            });
        }
    }

}
