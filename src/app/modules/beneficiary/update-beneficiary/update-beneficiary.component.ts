import { Component, OnInit, DoCheck, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { Router, ActivatedRoute } from '@angular/router';
import { HouseholdsService } from '../../../core/api/households.service';
import { ProjectService } from '../../../core/api/project.service';
import { LocationService } from '../../../core/api/location.service';
import { CriteriaService } from '../../../core/api/criteria.service';
import { CountrySpecificService } from '../../../core/api/country-specific.service';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatStepper } from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { LIVELIHOOD } from '../../../model/livelihood';
import { Location } from '../../../model/location';
import { Project } from '../../../model/project';
import { Criteria } from '../../../model/criteria';
import { CountrySpecific } from '../../../model/country-specific';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalLeaveComponent } from '../../../components/modals/modal-leave/modal-leave.component';
import { DesactivationGuarded } from '../../../core/guards/deactivate.guard';
import { DatePipe } from '@angular/common';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { CustomDateAdapter, APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';

@Component({
    selector: 'app-update-beneficiary',
    templateUrl: './update-beneficiary.component.html',
    styleUrls: ['./update-beneficiary.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class UpdateBeneficiaryComponent implements OnInit, DoCheck, DesactivationGuarded {

    // Mode
    public mode: string;
    public validationLoading = false;

    // Translate
    public Text = GlobalText.TEXTS;

    // Household objects
    public originalHousehold: any;
    public updatedHousehold: any;
    public countryISO3;
    public updateId;
    public loader = true;

    // DB Lists
    public provinceList = [];
    public districtList = [];
    public communeList = [];
    public villageList = [];
    public livelihoodsList: string[];
    public vulnerabilityList = [];
    public projectList = [];

    // Country Codes (PhoneNumber lib)
    private CodesMethods = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    private getCountryISO2 = require('country-iso-3-to-2');
    public countryCodesList = [];
    public filteredCountryCodesList: Observable<any[]>;

    // Constant lists
    public genderList: string[] = ['F', 'M'];
    public typePhoneList: string[] = ['Mobile', 'Landline'];
    public typeNationalIdList: string[] = ['Passport', 'ID Card', 'Driver\'s License', 'Family Registry', 'Other'];
    public typeNationalIdNamesList: object = {
        'Passport': this.Text.national_id_passport,
        'ID Card': this.Text.national_id_card,
        'Driver\'s License': this.Text.national_id_license,
        'Family Registry': this.Text.national_id_family_registry,
        'Other': this.Text.national_id_other
    };
    public residencyStatusList: string[] = ['Refugee', 'IDP', 'Resident'];

    // Checkpoint
    validStep1 = false;
    validStep2 = false;
    validStep3 = false;

    // Table
    public tableColumns: string[] = ['Given name', 'Family name', 'Gender', 'Birth date', 'Phone', 'National id'];
    public tableData: MatTableDataSource<any>;

    // Edit watcher
    private uneditedSnapshot: any;

    constructor(
        public route: ActivatedRoute,
        public _projectService: ProjectService,
        public _locationService: LocationService,
        public _criteriaService: CriteriaService,
        public _countrySpecificsService: CountrySpecificService,
        public _cacheService: AsyncacheService,
        public _householdsService: HouseholdsService,
        public _beneficiariesService: BeneficiariesService,
        public formBuilder: FormBuilder,
        public dialog: MatDialog,
        public snackbar: SnackbarService,
        public router: Router,
        private datePipe: DatePipe
    ) { }

    ngOnInit() {
        // Set right mode (update or create)
        if (this.router.url.split('/')[2] === 'update-beneficiary') {
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

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.Text !== GlobalText.TEXTS) {
            this.Text = GlobalText.TEXTS;
        }
    }

    /**
     * Gets household from backend and loads the method that will fill our 'updatedHousehold' attribute for input display and update.
     */
    initiateHousehold() {
        this.updatedHousehold = {
            // First set the format of a Household for Input Forms
            // id: 0,
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
        };

        // Set the Head if the user is creating
        if (this.mode === 'create') {
            this._cacheService.get(AsyncacheService.COUNTRY).subscribe(
                result => {
                    this.loader = false;
                    const cacheCountry = result;
                    if (cacheCountry) {
                        this.countryISO3 = cacheCountry;
                    } else {
                        this.countryISO3 = 'KHM';
                    }
                    this.getCountryCodes();
                    this.updatedHousehold.beneficiaries.unshift(this.pushBeneficiary());
                    this.getCountrySpecifics().subscribe((countrySpecificsList: any) => {
                        this.updatedHousehold.specificAnswers = countrySpecificsList;
                        this.snapshot();
                    });

                }
            );
        }

        // Get the selected household if the user is updating
        if (this.mode === 'update') {
            this.route.params.subscribe(
                result => {
                    if (result['id']) {
                        this._householdsService.getOne(result['id']).subscribe(
                            household => {
                                this.originalHousehold = household;
                                this.getCountryCodes();
                                this.formatHouseholdForForm();
                                this.loader = false;
                                this.snapshot();
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
        this.updateId = this.originalHousehold.id;
        this.updatedHousehold.address_number = this.originalHousehold.address_number;
        this.updatedHousehold.address_postcode = this.originalHousehold.address_postcode;
        this.updatedHousehold.address_street = this.originalHousehold.address_street;
        this.updatedHousehold.notes = this.originalHousehold.notes;
        this.updatedHousehold.livelihood = this.livelihoodsList[this.originalHousehold.livelihood];

        // CountrySpecifics
        if (this.originalHousehold.country_specific_answers) {
            this.originalHousehold.country_specific_answers.forEach(
                element => {
                    this.updatedHousehold.specificAnswers.push(
                        {
                            // Country Specific format for Form
                            answer: element.answer,
                            countryIso3: element.country_specific.country_iso3,
                            field_string: element.country_specific.field_string,
                            id: element.country_specific.id,
                            type: element.country_specific.type
                        }
                    );
                }
            );
        }

        // Projects.
        this.updatedHousehold.projects = [];
        this.originalHousehold.projects.forEach(
            element => {
                this.updatedHousehold.projects.push('' + element.id + ' - ' + element.name);
            }
        );

        // Location.
        const location = Location.formatAdmFromApi(this.originalHousehold.location);
        this.countryISO3 = location.country_iso3;
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
                } else {
                    this.updatedHousehold.beneficiaries.push(this.pushBeneficiary(beneficiary));
                }
            }
        );
    }

    /**
     * Format beneficiary date to a short string.
     */
    formatDate(date: Date) {
        const pipedDate = this.datePipe.transform(date, 'dd-MM-yyyy');
        return (pipedDate);
    }

     /**
     * Format beneficiary date to a short string.
     */
    changeDateOfBirth(event, index) {

        // the date is typed as dd-mm-yyyy and need to be put to mm-dd-yyy to use new Date
        const splittedDate = event.target.value.split('-');
        const day = splittedDate[0];
        const month = splittedDate[1];
        const year = splittedDate[2];
        const date = month + '-' + day + '-' + year;
        this.updatedHousehold.beneficiaries[index].birth_date = new Date(date);
    }

    /**
     * Formats all the changes in the updatedHousehold object linked to the forms into a Household object readable by the Backend.
     */
    formatHouseholdForApi(): any {
        const finalHousehold = this.updatedHousehold;

        const finalBeneficiaries = this.updatedHousehold.beneficiaries.slice(0);
        let dataHousehold;

        dataHousehold = {
            address_number: '',
            address_postcode: '',
            address_street: '',
            beneficiaries: [],
            country_specific_answers: [],
            // id: undefined,
            latitude: '0',
            livelihood: undefined,
            location: {},
            longitude: '0',
            notes: '',
        };

        if (this.nextValidation(4, null, true)) {

            // Format address & basic fields
            dataHousehold.address_number = finalHousehold.address_number;
            dataHousehold.address_postcode = finalHousehold.address_postcode;
            dataHousehold.address_street = finalHousehold.address_street;
            dataHousehold.livelihood = this.livelihoodsList.indexOf(finalHousehold.livelihood);
            dataHousehold.notes = finalHousehold.notes;
            // dataHousehold.id = finalHousehold.id;

            // Beneficiaries
            finalBeneficiaries.forEach(
                element => {
                    const beneficiary = {
                        date_of_birth: '',
                        residency_status: '',
                        family_name: '',
                        gender: 0,
                        given_name: '',
                        national_ids: [],
                        phones: [],
                        profile: {
                            photo: '',
                        },
                        status: 0,
                        // updated_on: new Date(),
                        vulnerability_criteria: [],
                    };
                    beneficiary.date_of_birth = this.formatDate(element.birth_date);
                    beneficiary.residency_status = element.residency_status;
                    beneficiary.family_name = element.family_name;

                    if (element.gender === 'F') {
                        beneficiary.gender = 0;
                    } else if (element.gender === 'M') {
                        beneficiary.gender = 1;
                    }

                    beneficiary.given_name = element.given_name;

                    if (element.id) {
                        beneficiary['id'] = element.id;
                    }

                    if (finalBeneficiaries.indexOf(element) === 0) {
                        beneficiary.status = 1;
                    } else {
                        beneficiary.status = 0;
                    }

                    if (element.national_id.number && element.national_id.type) {
                        beneficiary.national_ids.push(
                            {
                                id: undefined,
                                id_number: element.national_id.number,
                                id_type: element.national_id.type,
                            }
                        );
                    }

                    element.phone.forEach(
                        phone => {
                            if (phone.number) {
                                beneficiary.phones.push(
                                    {
                                        id: undefined,
                                        number: phone.number,
                                        type: phone.type,
                                        proxy: phone.proxy,
                                        prefix: phone.code ? phone.code.split('- ')[1] : undefined
                                    }
                                );
                            }
                        }
                    );
                    if (this.originalHousehold) {
                        this.originalHousehold.beneficiaries.forEach(
                            benef => {
                                if (beneficiary['id'] && benef.id === beneficiary['id']) {
                                    beneficiary.profile = benef.profile;
                                }
                            }
                        );
                    }
                    element.vulnerabilities.forEach(
                        (vulnerability, index) => {
                            if (vulnerability === true) {
                                beneficiary.vulnerability_criteria.push(
                                    {
                                        id: this.vulnerabilityList[index].id_field,
                                        field_string: this.vulnerabilityList[index].field_string,
                                    }
                                );
                            }
                        }
                    );
                    dataHousehold.beneficiaries.push(beneficiary);
                }
            );

            // Location
            const copyAdm1 = finalHousehold.location.adm1.split(' - ')[1];
            let copyAdm2;
            let copyAdm3;
            let copyAdm4;

            if (finalHousehold.location.adm2) {
                copyAdm2 = finalHousehold.location.adm2.split(' - ')[1];
            }
            if (finalHousehold.location.adm3) {
                copyAdm3 = finalHousehold.location.adm3.split(' - ')[1];
            }
            if (finalHousehold.location.adm4) {
                copyAdm4 = finalHousehold.location.adm4.split(' - ')[1];
            }

            dataHousehold.location = {
                adm1: copyAdm1,
                adm2: copyAdm2,
                adm3: copyAdm3,
                adm4: copyAdm4,
                country_iso3: this.countryISO3,
            };

            // Specifics
            finalHousehold.specificAnswers.forEach(
                result => {
                    const specific = {
                        countryIso3: this.countryISO3,
                        field: result.field_string,
                        id: result.id,
                        name: '',
                        type: result.type,
                    };

                    dataHousehold.country_specific_answers.push(
                        {
                            answer: result.answer,
                            country_specific: specific,
                        }
                    );
                }
            );
            return (dataHousehold);
        } else {
            // Minimum data not filled -> Error !
            this.snackbar.error(this.Text.update_beneficiary_check_steps);
            return (undefined);
        }

    }

    /**
     * Returns a formated Beneficiary readable for the inputs from an instance of backend beneficiary.
     * @param beneficiary
     */
    pushBeneficiary(beneficiary?: any) {
        const formatedBeneficiary = {
            // Format of a beneficiary for Form
            id: undefined,
            birth_date: new Date(),
            residency_status: 'Resident',
            family_name: this.updatedHousehold.beneficiaries[0] ? this.updatedHousehold.beneficiaries[0].family_name : '',
            given_name: '',
            gender: '',
            national_id: {
                number: '',
                type: 'ID Card'
            },
            phone: [
                {
                    code: this.countryCodesList[this.getUserPhoneCode()],
                    number: '',
                    type: 'Mobile',
                    proxy: false
                },
                {
                    code: this.countryCodesList[this.getUserPhoneCode()],
                    number: '',
                    type: 'Landline',
                    proxy: false
                }
            ],
            vulnerabilities: []
        };

        if (beneficiary) {
            formatedBeneficiary.id = beneficiary.id;
            formatedBeneficiary.family_name = beneficiary.family_name;
            formatedBeneficiary.given_name = beneficiary.given_name;

            if (beneficiary.gender === 0) {
                formatedBeneficiary.gender = 'F';
            } else if (beneficiary.gender === 1) {
                formatedBeneficiary.gender = 'M';
            }
        }

        if (beneficiary && beneficiary.date_of_birth) {
            const benefDate = beneficiary.date_of_birth.split('-');
            formatedBeneficiary.birth_date = new Date(benefDate[0], benefDate[1] - 1, benefDate[2], 0, 0);
        }

        if (beneficiary && beneficiary.residency_status) {
            formatedBeneficiary.residency_status = beneficiary.residency_status;
        }

        if (beneficiary && beneficiary.national_ids[0]) {
            formatedBeneficiary.national_id.number = beneficiary.national_ids[0].id_number;
            formatedBeneficiary.national_id.type = beneficiary.national_ids[0].id_type;
        }

        if (beneficiary && beneficiary.phones) {
            beneficiary.phones.forEach((phone, i) => {
                formatedBeneficiary.phone[i].number = phone.number;
                formatedBeneficiary.phone[i].type = phone.type;
                formatedBeneficiary.phone[i].proxy = phone.proxy;
                formatedBeneficiary.phone[i].code = this.countryCodesList[this.getUserPhoneCode(phone.prefix)];
            });
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
        if (index < this.updatedHousehold.beneficiaries.length) {
            this.updatedHousehold.beneficiaries.splice(index, 1);
        }
    }

    passHousehold() {
        this.tableData = new MatTableDataSource(this.updatedHousehold.beneficiaries);
    }

    /**
     * Get child locations again list when an adm is selected.
     */
    reloadLocation(adm: number) {
        switch (adm) {
            case 1: this.getDistrict(this.updatedHousehold.location.adm1);
                break;
            case 2: this.getCommune(this.updatedHousehold.location.adm2);
                break;
            case 3: this.getVillage(this.updatedHousehold.location.adm3);
                break;
            default:
                break;
        }
    }

    /**
     * Get correct list of country codes matching the user input.
     */
    reloadCountryCodes(index: number) {
        const typed = this.updatedHousehold.beneficiaries[index].phone.code;

        this.filteredCountryCodesList = this.filter(String(typed), this.countryCodesList);
    }

    /**
     * Call backend to create a new household with filled data.
     */
    create() {
        if (this.updatedHousehold.projects.length === 0) {
            this.snackbar.error('You must select at least one project');
            return;
        }

        const body = this.formatHouseholdForApi();

        const selectedProjectsIds = new Array<string>();
        this.updatedHousehold.projects.forEach(
            project => {
                selectedProjectsIds.push(project.split(' - ')[0]);
            }
        );
        if (body) {
            this.validationLoading = true;
            this._householdsService.add(body, selectedProjectsIds).toPromise()
                .then(
                    success => {
                        if (success) {
                            this.snackbar.success(this.Text.update_beneficiary_created_successfully);
                            this.leave();
                        } else {
                            this.validationLoading = false;
                        }
                    }
                )
                .catch(
                    error => {
                        this.snackbar.error(this.Text.update_beneficiary_error_creating + error);
                        this.validationLoading = false;
                    }
                );
        }
    }

    /**
     * Call backend to update the selected household with filled data.
     */
    update() {
        if (this.updatedHousehold.projects.length === 0) {
            this.snackbar.error('You must select at least one project');
            return;
        }

        const body = this.formatHouseholdForApi();

        const selectedProjectsIds = new Array<string>();
        this.updatedHousehold.projects.forEach(
            project => {
                selectedProjectsIds.push(project.split(' - ')[0]);
            }
        );
        if (body) {
            this.validationLoading = true;
            this._householdsService.edit(this.updateId, body, selectedProjectsIds).toPromise()
                .then(
                    success => {
                        if (success) {
                            this.snackbar.success(this.Text.update_beneficiary_updated_successfully);
                            this.leave();
                        } else {
                            this.validationLoading = false;
                        }
                    }
                )
                .catch(
                    error => {
                        this.snackbar.error(this.Text.update_beneficiary_error_updated + error);
                        this.validationLoading = false;
                    }
                );
        }
    }

    /**
     * Verify the needed forms before going next step : Blocks if any error (empty/bad type/format).
     * TODO : bind stepper steps in order to control navigation.
     */
    nextValidation(step: number, stepper: MatStepper, final?: boolean): boolean {
        let validSteps = 0;
        let message = '';
        if (!final) {
            final = false;
        }

        if (step === 1 || final) {
            const hh = this.updatedHousehold;

            if (!hh.location.adm1) {
                message = 'You must select a location';
            } else if (!hh.address_number) {
                message = 'You must enter an address number';
            } else if (!hh.address_postcode) {
                message = 'You must enter an address postcode';
            } else if (!hh.address_street) {
                message = 'You must enter an address street';
            } else if (hh.livelihood && !this.elementExists(hh.livelihood, this.livelihoodsList)) {
                message = 'Please select an existing livelihood from the list';
            } else {
                if (step <= 1) { stepper.next(); }
                if (final) { validSteps++; }
            }
        }
        if (step === 2 || final) {
            const head = this.updatedHousehold.beneficiaries[0];

            if (!head.family_name) {
                message = 'You must enter a family name';
            } else if (!head.given_name) {
                message = 'You must enter a given name';
            } else if (!head.gender) {
                message = 'You must select a gender';
            } else if (head.phone.number && isNaN(Number(head.phone.number))) {
                message = 'Phone can only be composed by digits';
            } else if (head.phone.number && head.phone.code && !this.elementExists(head.phone.code, this.countryCodesList)) {
                message = 'Please select an existing country code from the list';
            } else if ((head.phone.number && !head.phone.code) || (head.phone.number && head.phone.code === '')) {
                message = 'Please select a country code for the phone number';
            } else if (head.birth_date && head.birth_date.getTime() > (new Date()).getTime()) {
                message = 'Please select a valid birth date';
            } else {
                if (step <= 2) { stepper.next(); }
                if (final) { validSteps++; }
            }
        }
        if (step === 3 || final) {
            let counter = 1;
            let gotError = false;
            const members = this.updatedHousehold.beneficiaries;

            for (let i = 1; i < members.length && !gotError; i++) {
                gotError = true;
                if (!members[i].family_name) {
                    message = 'You must enter a family name for member ' + i;
                } else if (!members[i].given_name) {
                    message = 'You must enter a given name for member ' + i;
                } else if (!members[i].gender) {
                    message = 'You must select a gender for member ' + i;
                } else if (members[i].phone.number && isNaN(Number(members[i].phone.number))) {
                    message = 'Phone can only be composed by digits for member ' + i;
                } else if (members[i].phone.number && members[i].phone.code
                    && !this.elementExists(members[i].phone.code, this.countryCodesList)) {
                    message = 'Please select an existing country code from the list for member ' + i;
                } else if ((members[i].phone.number && !members[i].phone.code)
                    || (members[i].phone.number && members[i].phone.code === '')) {
                    message = 'Please select a country code for the phone number of member ' + i;
                } else if (members[i].birth_date && members[i].birth_date.getTime() > (new Date()).getTime()) {
                    message = 'Please select a valid birth date for member ' + i;
                } else {
                    gotError = false;
                    counter++;
                }
            }
            if (counter === members.length) {
                if (step <= 3) { stepper.next(); }
                if (final) { validSteps++; }
            }
        }

        if (final) {
            return (validSteps === 3);
        } else if (message !== '') {
            this.snackbar.error(message);
        }

        return (false);
    }

    /**
     * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
     */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.checkIfFormHasBeenModified() && !this.validationLoading) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return (true);
        }
    }
    private checkIfFormHasBeenModified(): boolean {
        if (this.checkEqualValues(this.updatedHousehold, this.uneditedSnapshot)) {
            return false;
        }
        return true;
    }

    /**
     * Filter a list according to what the user types (needs formControl)
     */
    filter(value: string, element: any) {

        const filterValue = value.toLowerCase();

        return element.filter(option => option.toLowerCase().includes(filterValue));
    }

    /**
     * Creates a string to display the full location
     */
    getFullLocation() {
        let fullLocation: string;
        const actualLocation = this.updatedHousehold.location;

        if (actualLocation.adm1) {
            fullLocation = actualLocation.adm1.split('-')[1];
        }
        if (actualLocation.adm2) {
            fullLocation += ', ' + actualLocation.adm2.split('-')[1];
        }
        if (actualLocation.adm3) {
            fullLocation += ', ' + actualLocation.adm3.split('-')[1];
        }
        if (actualLocation.adm4) {
            fullLocation += ', ' + actualLocation.adm4.split('-')[1];
        }
        return (fullLocation);
    }

    /**
     * Get list of all country codes and put it in the list
     */
    getCountryCodes() {
        this.countryCodesList = this.CodesMethods.getSupportedRegions();

        for (let i = 0; i < this.countryCodesList.length; i++) {
            this.countryCodesList[i] = this.countryCodesList[i] + ' - '
                + '+' + this.CodesMethods.getCountryCodeForRegion(this.countryCodesList[i]).toString();
        }
    }

    /**
     * Get list of all project and put it in the project selector
     */
    getProjects() {
        this._projectService.get().subscribe(response => {
            this.projectList = [];
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
            this.provinceList = [];
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
            this.districtList = [];
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
            this.communeList = [];
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
            this.villageList = [];
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
            promise.subscribe(
                response => {
                    this.vulnerabilityList = [];
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
            return promise.pipe(
                map(response => {
                    const countrySpecificsList = [];

                    const responseCountrySpecifics = CountrySpecific.formatArray(response);
                    responseCountrySpecifics.forEach(element => {
                        countrySpecificsList.push(
                            {
                                answer: '',
                                countryIso3: this.countryISO3,
                                field_string: element.field,
                                id: element.id,
                                type: element.type,
                                name: element.name,
                            }
                        );
                    });
                    return countrySpecificsList;
                }));
        }
    }

    /**
     * Set default phone code depending on the user adm1 country
     */
    getUserPhoneCode(beneficiary?: any) {

        if (this.countryISO3) {
            if (beneficiary && typeof beneficiary === 'string') {
                return this.countryCodesList.findIndex(element => {
                    return element.split('- ')[1] === beneficiary;
                });
            }

            if (beneficiary) {
                const phone = beneficiary.phones.filter(element => element.type === 'Mobile');

                if (phone.length > 0) {
                    return this.countryCodesList.findIndex(element => {
                        return element.split('- ')[1] === phone[0].prefix;
                    });
                } else {
                    return '';
                }
            } else {
                let phoneCode;

                phoneCode = String(this.getCountryISO2(String(this.countryISO3)));
                phoneCode = phoneCode + ' - '
                    + '+' + this.CodesMethods.getCountryCodeForRegion(phoneCode);

                return this.countryCodesList.findIndex(element => {
                    return element === phoneCode;
                });
            }
        } else {
            return '';
        }
    }

    /**
     * alow to return in household page and abort the creation of household
     */
    leave() {
        this.router.navigate(['/beneficiaries']);
    }

    /**
     * Returns true if an element is part of an array (permits to verify that autocomplete choices are part of the matched list)
     * @param element
     * @param array
     */
    elementExists(element: any, array: any[]): boolean {
        let exists = false;

        if (array === this.countryCodesList) {
            const filter = array.filter(codes => codes === element);
            if (filter.length > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            array.forEach(
                instance => {
                    if (instance === element) {
                        exists = true;
                    }
                }
            );

            return (exists);
        }
    }

    private snapshot(): void {
        this.uneditedSnapshot = this.deepCopy(this.updatedHousehold);
    }

    private deepCopy(object: any) {
        const copy = JSON.parse(JSON.stringify(object));
        return copy;
    }

    private checkEqualValues(object1: any, object2: any) {
        if (JSON.stringify(object1) === JSON.stringify(object2)) {
            return true;
        }
        return false;
    }
}
