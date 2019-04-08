import { Component, OnInit, DoCheck, HostListener, ViewChild } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { Router, ActivatedRoute } from '@angular/router';
import { HouseholdsService } from '../../../core/api/households.service';
import { ProjectService } from '../../../core/api/project.service';
import { LocationService } from '../../../core/api/location.service';
import { CriteriaService } from '../../../core/api/criteria.service';
import { CountrySpecificService } from '../../../core/api/country-specific.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource, MatStepper } from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { LIVELIHOOD } from '../../../model/livelihood';
import { Location } from '../../../model/location.new';
import { Project } from '../../../model/project.new';
import { Criteria } from '../../../model/criteria.new';
import { CountrySpecific } from '../../../model/country-specific.new';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalLeaveComponent } from '../../../components/modals/modal-leave/modal-leave.component';
import { DesactivationGuarded } from '../../../core/guards/deactivate.guard';
import { DatePipe } from '@angular/common';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { CustomDateAdapter, APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { Households } from 'src/app/model/households.new';
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { NationalId } from 'src/app/model/nationalId.new';
import { Phone } from 'src/app/model/phone.new';
import { VulnerabilityCriteria } from 'src/app/model/vulnerability-criteria.new';
import { CountrySpecificAnswer } from 'src/app/model/country-specific.new';
import { Profile } from 'src/app/model/profile.new';

@Component({
    selector: 'app-update-beneficiary',
    templateUrl: './update-beneficiary.component.html',
    styleUrls: ['./update-beneficiary.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class UpdateBeneficiaryComponent implements OnInit, DesactivationGuarded {

    // Mode
    public mode: string;
    public validationLoading = false;

    // Translate
    public Text = GlobalText.TEXTS;

    public household: Households;
    public mainFields: string[];
    public mainForm: FormGroup;

    public beneficiaries: Beneficiary[] = [];

    // public headBeneficiary: Beneficiary;
    public beneficiaryFields: string[];
    public beneficiariesForm: FormGroup[] = [];


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
    public livelihoodsList: any[];
    public vulnerabilityList: Array<VulnerabilityCriteria>;
    // public projectList = [];

    // Country Codes (PhoneNumber lib)
    private CodesMethods = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    private getCountryISO2 = require('country-iso-3-to-2');
    public countryCodesList = [];
    public filteredCountryCodesList: Observable<any[]>;

    // Constant lists
    // public genderList: string[] = ['F', 'M'];
    // public typePhoneList: string[] = ['Mobile', 'Landline'];
    // public typeNationalIdList: string[] = ['Passport', 'ID Card', 'Driver\'s License', 'Family Registry', 'Other'];
    // public typeNationalIdNamesList: object = {
    //     'Passport': this.Text.national_id_passport,
    //     'ID Card': this.Text.national_id_card,
    //     'Driver\'s License': this.Text.national_id_license,
    //     'Family Registry': this.Text.national_id_family_registry,
    //     'Other': this.Text.national_id_other
    // };
    // public residencyStatusList: string[] = ['Refugee', 'IDP', 'Resident'];

    // Checkpoint
    validStep1 = false;
    validStep2 = false;
    validStep3 = false;

    // Table
    public tableColumns: string[] = ['givenName', 'familyName', 'gender', 'dateOfBirth', 'phone', 'nationalId'];
    public tableData: MatTableDataSource<any>;

    // Edit watcher
    private uneditedSnapshot: any;

    @ViewChild(MatStepper) stepper: MatStepper;


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


        this.initiateHousehold().then(() => {
            this.getVulnerabilityCriteria().subscribe(() => {
                const countrySpecificNames = this.household.fields.countrySpecificAnswers.value.map(countrySpecificAnswer => {
                    return countrySpecificAnswer.fields.countrySpecific.value.fields.field.value;
                });
                this.mainFields = [
                    'adm1', 'adm2', 'adm3', 'adm4', 'addressNumber', 'addressPostcode', 'addressStreet', 'livelihood', 'notes', 'projects'];
                this.mainFields = this.mainFields.concat(countrySpecificNames);

                const vulnerabilityCriteriaNames = this.vulnerabilityList.map(vulnerability => {
                    return vulnerability.fields.name.value;
                });
                this.beneficiaryFields = [
                    'id', 'familyName', 'givenName', 'gender', 'dateOfBirth', 'IDType', 'IDNumber', 'residencyStatus',
                    'phoneType0', 'phoneNumber0', 'phonePrefix0', 'phoneProxy0',
                    'phoneType1', 'phoneNumber1', 'phonePrefix1', 'phoneProxy1'];
                this.beneficiaryFields = this.beneficiaryFields.concat(vulnerabilityCriteriaNames);


                this.makeMainForm();
                this.beneficiaries.forEach((beneficiary: Beneficiary) => {
                    this.makeBeneficiaryForm(beneficiary);
                });
                this.loader = false;
                this.livelihoodsList = LIVELIHOOD;
                this.getProjects();
            });
        });
    }

    makeMainForm() {
        const mainFormControls = {};
        this.mainFields.forEach((fieldName: string) => {

            // check if it is a field of beneficiary directly
            const field = this.household.fields[fieldName] ? this.household.fields[fieldName] : null;
            if (field && field.kindOfField === 'MultipleSelect') {
                // TODO: type this
                const selectedOptions = field.value.map(option => {
                    return option.fields.id.value;
                });
                mainFormControls[fieldName] = new FormControl(selectedOptions);
            } else {
                mainFormControls[fieldName] = new FormControl(
                    field ? field.value : null,
                );
            }
        });

        this.loadProvince().subscribe(() => {
            if (this.household.fields.location.value.fields.adm1.value &&
                this.household.fields.location.value.fields.adm1.value.fields.id.value) {
                const adm1Id = this.household.fields.location.value.fields.adm1.value.fields.id.value;
                mainFormControls['adm1'].setValue(adm1Id);
                this._locationService.fillAdm2Options(this.household, adm1Id).subscribe(() => {
                    if (this.household.fields.location.value.fields.adm2.value &&
                        this.household.fields.location.value.fields.adm2.value.fields.id.value) {
                        const adm2Id = this.household.fields.location.value.fields.adm2.value.fields.id.value;
                        mainFormControls['adm2'].setValue(adm2Id);
                        this._locationService.fillAdm3Options(this.household, adm2Id).subscribe(() => {
                            if (this.household.fields.location.value.fields.adm3.value &&
                                this.household.fields.location.value.fields.adm3.value.fields.id.value) {
                                const adm3Id = this.household.fields.location.value.fields.adm3.value.fields.id.value;
                                mainFormControls['adm3'].setValue(adm3Id);
                                this._locationService.fillAdm4Options(this.household, adm3Id).subscribe(() => {
                                    if (this.household.fields.location.value.fields.adm4.value) {
                                        mainFormControls['adm4'].setValue(
                                            this.household.fields.location.value.fields.adm4.value.fields.id.value);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        this.household.fields.countrySpecificAnswers.value.forEach(countrySpecificAnswer => {
            mainFormControls[countrySpecificAnswer.fields.countrySpecific.value.fields.field.value]
                .setValue(countrySpecificAnswer.fields.answer.value);
        });

        mainFormControls['livelihood'].setValue(this.household.fields.livelihood.value ? this.household.fields.livelihood.value.id : null);

        this.mainForm = new FormGroup(mainFormControls);
    }

    makeBeneficiaryForm(beneficiary: Beneficiary) {
        const beneficiaryFormControls = {};
        this.beneficiaryFields.forEach((fieldName: string) => {

            // check if it is a field of beneficiary directly
            const field = beneficiary.fields[fieldName] ? beneficiary.fields[fieldName] : null;
            if (field && field.kindOfField === 'SingleSelect') {
                beneficiaryFormControls[fieldName] = new FormControl(
                    field.value ? field.value.fields.id.value : null
                );
            } else {
                beneficiaryFormControls[fieldName] = new FormControl(
                    field ? field.value : null,
                );
            }
            if ( beneficiaryFormControls['familyName'] &&
                !beneficiaryFormControls['familyName'].value &&
                this.beneficiariesForm[0] &&
                this.beneficiariesForm[0].controls['familyName'].value
            ) {
                beneficiaryFormControls['familyName'].setValue(this.beneficiariesForm[0].controls['familyName'].value);
            }
        });

        const phone0 = beneficiary.fields.phones.value[0];
        const phone1 = beneficiary.fields.phones.value[1];

        if (phone0) {
            beneficiaryFormControls['phoneType0'].setValue(
                phone0.fields.type.value ? phone0.fields.type.value.fields.id.value : null);
            beneficiaryFormControls['phoneNumber0'].setValue(phone0.fields.number.value);
            beneficiaryFormControls['phoneProxy0'].setValue(phone0.fields.proxy.value);
            beneficiaryFormControls['phonePrefix0'].setValue(this.getPhonePrefix(phone0));
        }

        if (phone1) {
            beneficiaryFormControls['phoneType1'].setValue(
                phone1.fields.type.value ? phone1.fields.type.value.fields.id.value : null);
            beneficiaryFormControls['phoneNumber1'].setValue(phone1.fields.number.value);
            beneficiaryFormControls['phoneProxy1'].setValue(phone1.fields.proxy.value);
            beneficiaryFormControls['phonePrefix1'].setValue(this.getPhonePrefix(phone1));
        }

        beneficiaryFormControls['IDType'].setValue(beneficiary.fields.nationalIds.value[0].fields.type.value.fields.id.value);
        beneficiaryFormControls['IDNumber'].setValue(beneficiary.fields.nationalIds.value[0].fields.number.value);

        beneficiary.fields.vulnerabilities.value.forEach(vulnerability => {
            beneficiaryFormControls[vulnerability.fields.name.value].setValue(true);
        });

        const beneficiaryForm = new FormGroup(beneficiaryFormControls);
        this.beneficiariesForm.push(beneficiaryForm);
    }


    // /**
    //  * check if the langage has changed
    //  */
    // ngDoCheck() {
    //     if (this.Text !== GlobalText.TEXTS) {
    //         this.Text = GlobalText.TEXTS;
    //     }
    // }

    /**
     * Gets household from backend and loads the method that will fill our 'updatedHousehold' attribute for input display and update.
     */
    initiateHousehold() {
        // this.updatedHousehold = {
        //     // First set the format of a Household for Input Forms
        //     // id: 0,
        //     address_number: '',
        //     address_postcode: '',
        //     address_street: '',
        //     livelihood: '',
        //     notes: '',
        //     beneficiaries: [],
        //     projects: [],
        //     specificAnswers: [],
        //     location: {
        //         adm1: '',
        //         adm2: '',
        //         adm3: '',
        //         adm4: '',
        //     },
        // };

        return new Promise((resolve, reject) => {
            if (this.mode === 'create') {
                this._cacheService.get(AsyncacheService.COUNTRY).subscribe(
                    result => {
                        const cacheCountry = result;
                        if (cacheCountry) {
                            this.countryISO3 = cacheCountry;
                        } else {
                            this.countryISO3 = 'KHM';
                        }
                        this.getCountryPhoneCodes();
                        this.household = new Households();
                        this.household.fields.location.value = new Location();

                        this.beneficiaries[0] = this.createNewBeneficiary();

                        // this.household.fields.beneficiaries.value.push(this.beneficiaries[0])
                        // this.updatedHousehold.beneficiaries.unshift(this.pushBeneficiary());
                        // this.getCountrySpecifics().subscribe((countrySpecificsList: any) => {
                        //     this.updatedHousehold.specificAnswers = countrySpecificsList;
                        //     this.snapshot();
                        // });
                        this.getCountrySpecifics().subscribe(() => {
                            resolve();
                        });
                    }
                );
            }

            if (this.mode === 'update') {
                this.route.params.subscribe(
                    result => {
                        if (result['id']) {
                            this._householdsService.getOne(result['id']).subscribe(
                                household => {
                                    this.getCountryPhoneCodes();
                                    this.household = Households.apiToModel(household);
                                    this.snapshot();
                                    // this.originalHousehold = household;
                                    // this.getCountryPhoneCodes();
                                    // this.formatHouseholdForForm();
                                    // this.loader = false;
                                    // this.snapshot();

                                    this.beneficiaries = this.household.fields.beneficiaries.value;
                                    resolve();
                                }
                            );
                        }
                    }
                );
            }
        });
    }

    createNewBeneficiary() {
        const beneficiary = new Beneficiary();
        beneficiary.fields.profile.value = new Profile();
        beneficiary.fields.nationalIds.value = [new NationalId()];
        const phone1 = new Phone();
        const phone2 = new Phone();
        phone1.fields.type.value = phone1.fields.type.options[0];
        phone2.fields.type.value = phone2.fields.type.options[1];
        beneficiary.fields.phones.value = [phone1, phone2];
        return beneficiary;
    }

    addBeneficiary() {
        const beneficiary = this.createNewBeneficiary();
        this.beneficiaries.push(beneficiary);
        this.makeBeneficiaryForm(beneficiary);
    }

     /**
     * To delete a beneficiary from the actual household.
     * @param index
     */
    removeBeneficiary(index: number) {
        if (index < this.beneficiaries.length) {
            this.beneficiaries.splice(index, 1);
        }
        if (index < this.beneficiariesForm.length) {
            this.beneficiariesForm.splice(index, 1);
        }
    }


    // /**
    //  * Transforms an instance of backend beneficiary in a formated Household readable for the inputs.
    //  */
    // formatHouseholdForForm() {
    //     // Id & address & livelihood & notes.
    //     this.updateId = this.originalHousehold.id;
    //     this.updatedHousehold.address_number = this.originalHousehold.address_number;
    //     this.updatedHousehold.address_postcode = this.originalHousehold.address_postcode;
    //     this.updatedHousehold.address_street = this.originalHousehold.address_street;
    //     this.updatedHousehold.notes = this.originalHousehold.notes;
    //     this.updatedHousehold.livelihood = this.livelihoodsList[this.originalHousehold.livelihood];

    //     // CountrySpecifics
    //     if (this.originalHousehold.country_specific_answers) {
    //         this.originalHousehold.country_specific_answers.forEach(
    //             element => {
    //                 this.updatedHousehold.specificAnswers.push(
    //                     {
    //                         // Country Specific format for Form
    //                         answer: element.answer,
    //                         countryIso3: element.country_specific.country_iso3,
    //                         field_string: element.country_specific.field_string,
    //                         id: element.country_specific.id,
    //                         type: element.country_specific.type
    //                     }
    //                 );
    //             }
    //         );
    //     }

    //     // Projects.
    //     this.updatedHousehold.projects = [];
    //     this.originalHousehold.projects.forEach(
    //         element => {
    //             this.updatedHousehold.projects.push('' + element.id + ' - ' + element.name);
    //         }
    //     );

    //     // Location.
    //     const location = Location.formatAdmFromApi(this.originalHousehold.location);
    //     this.countryISO3 = location.country_iso3;
    //     this.updatedHousehold.location.adm1 = Location.formatOneAdm(location.adm1);

    //     if (location.adm1) {
    //         this.getDistrict(String(location.adm1.id));
    //     }
    //     if (location.adm2) {
    //         this.updatedHousehold.location.adm2 = Location.formatOneAdm(location.adm2);
    //         this.getCommune(String(location.adm2.id));
    //     }
    //     if (location.adm3) {
    //         this.updatedHousehold.location.adm3 = Location.formatOneAdm(location.adm3);
    //         this.getVillage(String(location.adm3.id));
    //     }
    //     if (location.adm4) {
    //         this.updatedHousehold.location.adm4 = Location.formatOneAdm(location.adm4);
    //     }

    //     // Beneficiaries.
    //     this.originalHousehold.beneficiaries.forEach(
    //         beneficiary => {
    //             // Head.
    //             if (beneficiary.status === true) {
    //                 this.updatedHousehold.beneficiaries.unshift(this.pushBeneficiary(beneficiary));
    //             } else {
    //                 this.updatedHousehold.beneficiaries.push(this.pushBeneficiary(beneficiary));
    //             }
    //         }
    //     );
    // }

    /**
     * Format beneficiary date to a short string.
     */
    formatDate(date: Date) {
        const pipedDate = this.datePipe.transform(date, 'yyyy-MM-dd');

        return (pipedDate);
    }

    // /**
    //  * Formats all the changes in the updatedHousehold object linked to the forms into a Household object readable by the Backend.
    //  */
    // formatHouseholdForApi(): any {
    //     const finalHousehold = this.updatedHousehold;

    //     const finalBeneficiaries = this.updatedHousehold.beneficiaries.slice(0);
    //     let dataHousehold;

    //     dataHousehold = {
    //         address_number: '',
    //         address_postcode: '',
    //         address_street: '',
    //         beneficiaries: [],
    //         country_specific_answers: [],
    //         // id: undefined,
    //         latitude: '0',
    //         livelihood: undefined,
    //         location: {},
    //         longitude: '0',
    //         notes: '',
    //     };

    //     if (this.nextValidation(4, null, true)) {

    //         // Format address & basic fields
    //         dataHousehold.address_number = finalHousehold.address_number;
    //         dataHousehold.address_postcode = finalHousehold.address_postcode;
    //         dataHousehold.address_street = finalHousehold.address_street;
    //         dataHousehold.livelihood = this.livelihoodsList.indexOf(finalHousehold.livelihood);
    //         dataHousehold.notes = finalHousehold.notes;
    //         // dataHousehold.id = finalHousehold.id;

    //         // Beneficiaries
    //         finalBeneficiaries.forEach(
    //             element => {
    //                 const beneficiary = {
    //                     date_of_birth: '',
    //                     residency_status: '',
    //                     family_name: '',
    //                     gender: 0,
    //                     given_name: '',
    //                     national_ids: [],
    //                     phones: [],
    //                     profile: {
    //                         photo: '',
    //                     },
    //                     status: 0,
    //                     // updated_on: new Date(),
    //                     vulnerability_criteria: [],
    //                 };
    //                 beneficiary.date_of_birth = this.formatDate(element.birth_date);
    //                 beneficiary.residency_status = element.residency_status;
    //                 beneficiary.family_name = element.family_name;

    //                 if (element.gender === 'F') {
    //                     beneficiary.gender = 0;
    //                 } else if (element.gender === 'M') {
    //                     beneficiary.gender = 1;
    //                 }

    //                 beneficiary.given_name = element.given_name;

    //                 if (element.id) {
    //                     beneficiary['id'] = element.id;
    //                 }

    //                 if (finalBeneficiaries.indexOf(element) === 0) {
    //                     beneficiary.status = 1;
    //                 } else {
    //                     beneficiary.status = 0;
    //                 }

    //                 if (element.national_id.number && element.national_id.type) {
    //                     beneficiary.national_ids.push(
    //                         {
    //                             id: undefined,
    //                             id_number: element.national_id.number,
    //                             id_type: element.national_id.type,
    //                         }
    //                     );
    //                 }

    //                 element.phone.forEach(
    //                     phone => {
    //                         if (phone.number) {
    //                             beneficiary.phones.push(
    //                                 {
    //                                     id: undefined,
    //                                     number: phone.number,
    //                                     type: phone.type,
    //                                     proxy: phone.proxy,
    //                                     prefix: phone.code ? phone.code.split('- ')[1] : undefined
    //                                 }
    //                             );
    //                         }
    //                     }
    //                 );
    //                 if (this.originalHousehold) {
    //                     this.originalHousehold.beneficiaries.forEach(
    //                         benef => {
    //                             if (beneficiary['id'] && benef.id === beneficiary['id']) {
    //                                 beneficiary.profile = benef.profile;
    //                             }
    //                         }
    //                     );
    //                 }
    //                 element.vulnerabilities.forEach(
    //                     (vulnerability, index) => {
    //                         if (vulnerability === true) {
    //                             beneficiary.vulnerability_criteria.push(
    //                                 {
    //                                     id: this.vulnerabilityList[index].id_field,
    //                                     field_string: this.vulnerabilityList[index].field_string,
    //                                 }
    //                             );
    //                         }
    //                     }
    //                 );
    //                 dataHousehold.beneficiaries.push(beneficiary);
    //             }
    //         );

    //         // Location
    //         const copyAdm1 = finalHousehold.location.adm1.split(' - ')[1];
    //         let copyAdm2;
    //         let copyAdm3;
    //         let copyAdm4;

    //         if (finalHousehold.location.adm2) {
    //             copyAdm2 = finalHousehold.location.adm2.split(' - ')[1];
    //         }
    //         if (finalHousehold.location.adm3) {
    //             copyAdm3 = finalHousehold.location.adm3.split(' - ')[1];
    //         }
    //         if (finalHousehold.location.adm4) {
    //             copyAdm4 = finalHousehold.location.adm4.split(' - ')[1];
    //         }

    //         dataHousehold.location = {
    //             adm1: copyAdm1,
    //             adm2: copyAdm2,
    //             adm3: copyAdm3,
    //             adm4: copyAdm4,
    //             country_iso3: this.countryISO3,
    //         };

    //         // Specifics
    //         finalHousehold.specificAnswers.forEach(
    //             result => {
    //                 const specific = {
    //                     countryIso3: this.countryISO3,
    //                     field: result.field_string,
    //                     id: result.id,
    //                     name: '',
    //                     type: result.type,
    //                 };

    //                 dataHousehold.country_specific_answers.push(
    //                     {
    //                         answer: result.answer,
    //                         country_specific: specific,
    //                     }
    //                 );
    //             }
    //         );
    //         return (dataHousehold);
    //     } else {
    //         // Minimum data not filled -> Error !
    //         this.snackbar.error(this.Text.update_beneficiary_check_steps);
    //         return (undefined);
    //     }

    // }

    // /**
    //  * Returns a formated Beneficiary readable for the inputs from an instance of backend beneficiary.
    //  * @param beneficiary
    //  */
    // pushBeneficiary(beneficiary?: any) {
    //     const formatedBeneficiary = {
    //         // Format of a beneficiary for Form
    //         id: undefined,
    //         birth_date: new Date(),
    //         residency_status: 'Resident',
    //         family_name: this.updatedHousehold.beneficiaries[0] ? this.updatedHousehold.beneficiaries[0].family_name : '',
    //         given_name: '',
    //         gender: '',
    //         national_id: {
    //             number: '',
    //             type: 'ID Card'
    //         },
    //         phone: [
    //             {
    //                 code: this.countryCodesList[this.getUserPhoneCode()],
    //                 number: '',
    //                 type: 'Mobile',
    //                 proxy: false
    //             },
    //             {
    //                 code: this.countryCodesList[this.getUserPhoneCode()],
    //                 number: '',
    //                 type: 'Landline',
    //                 proxy: false
    //             }
    //         ],
    //         vulnerabilities: []
    //     };

    //     if (beneficiary) {
    //         formatedBeneficiary.id = beneficiary.id;
    //         formatedBeneficiary.family_name = beneficiary.family_name;
    //         formatedBeneficiary.given_name = beneficiary.given_name;

    //         if (beneficiary.gender === 0) {
    //             formatedBeneficiary.gender = 'F';
    //         } else if (beneficiary.gender === 1) {
    //             formatedBeneficiary.gender = 'M';
    //         }
    //     }

    //     if (beneficiary && beneficiary.date_of_birth) {
    //         const benefDate = beneficiary.date_of_birth.split('-');
    //         formatedBeneficiary.birth_date = new Date(benefDate[0], benefDate[1] - 1, benefDate[2], 0, 0);
    //     }

    //     if (beneficiary && beneficiary.residency_status) {
    //         formatedBeneficiary.residency_status = beneficiary.residency_status;
    //     }

    //     if (beneficiary && beneficiary.national_ids[0]) {
    //         formatedBeneficiary.national_id.number = beneficiary.national_ids[0].id_number;
    //         formatedBeneficiary.national_id.type = beneficiary.national_ids[0].id_type;
    //     }

    //     if (beneficiary && beneficiary.phones) {
    //         beneficiary.phones.forEach((phone, i) => {
    //             formatedBeneficiary.phone[i].number = phone.number;
    //             formatedBeneficiary.phone[i].type = phone.type;
    //             formatedBeneficiary.phone[i].proxy = phone.proxy;
    //             formatedBeneficiary.phone[i].code = this.countryCodesList[this.getUserPhoneCode(phone.prefix)];
    //         });
    //     }

    //     this.vulnerabilityList.forEach(
    //         element => {
    //             formatedBeneficiary.vulnerabilities.push(false);
    //             if (beneficiary && beneficiary.vulnerability_criteria) {
    //                 beneficiary.vulnerability_criteria.forEach(
    //                     vulnerability => {
    //                         if (element.field_string === vulnerability.field_string) {
    //                             formatedBeneficiary.vulnerabilities[this.vulnerabilityList.indexOf(element)] = true;
    //                         }
    //                     });
    //             }
    //         });
    //     return (formatedBeneficiary);
    // }

    passHousehold() {
        this.tableData = new MatTableDataSource(this.beneficiariesForm);
    }

    // /**
    //  * Get child locations again list when an adm is selected.
    //  */
    // reloadLocation(adm: number) {
    //     switch (adm) {
    //         case 1: this.getDistrict(this.updatedHousehold.location.adm1);
    //             break;
    //         case 2: this.getCommune(this.updatedHousehold.location.adm2);
    //             break;
    //         case 3: this.getVillage(this.updatedHousehold.location.adm3);
    //             break;
    //         default:
    //             break;
    //     }
    // }

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
    submit() {
        if (this.mainForm.controls.projects.value.length < 1) {
            this.snackbar.error('You must select at least one project');
            return;
        }

        this.household.fields.addressNumber.value = this.mainForm.controls.addressNumber.value;
        this.household.fields.addressStreet.value = this.mainForm.controls.addressStreet.value;
        this.household.fields.addressPostcode.value = this.mainForm.controls.addressPostcode.value;
        this.household.fields.livelihood.value = this.getLivelihood();
        this.household.fields.notes.value = this.mainForm.controls.notes.value;

        this.household.fields.projects.value = this.household.fields.projects.options.filter(project => {
            return this.mainForm.controls.projects.value.includes(project.fields.id.value);
        });
        const adms = ['adm1', 'adm2', 'adm3', 'adm4'];

        adms.forEach(field => {
            if (this.mainForm.controls[field].value) {
                this.household.fields.location.value.fields[field].value =
                    this.household.fields.location.value.fields[field].options.filter(option => {
                        return option.fields.id.value === this.mainForm.controls[field].value;
                    })[0];
            }
        });

        this._cacheService.get('country')
            .subscribe(
                result => {
                    this.household.fields.location.value.fields.countryIso3 = result;
                }
            );
        this.household.fields.countrySpecificAnswers.value.forEach(countrySpecificAnswer => {
            countrySpecificAnswer.fields.answer.value =
                this.mainForm.controls[countrySpecificAnswer.fields.countrySpecific.value.fields.field.value].value;
        });

        const beneficiaries: Beneficiary[] = [];

        this.beneficiariesForm.forEach((form, index) => {
            let beneficiary: Beneficiary;
            if (form.controls.id.value) {
                beneficiary = this.household.fields.beneficiaries.value.filter((householdBeneficiary: Beneficiary) => {
                    return householdBeneficiary.fields.id.value === form.controls.id.value;
                })[0];
            } else {
                beneficiary = this.createNewBeneficiary();
            }

            beneficiary.fields.familyName.value = form.controls.familyName.value;
            beneficiary.fields.givenName.value = form.controls.givenName.value;
            beneficiary.fields.dateOfBirth.value = form.controls.dateOfBirth.value;
            beneficiary.fields.beneficiaryStatus.value = index === 0 ? 1 : 0;
            beneficiary.fields.gender.value = beneficiary.fields.gender.options.filter(option => {
                return  option.fields.id.value === form.controls.gender.value;
            })[0];
            beneficiary.fields.residencyStatus.value = beneficiary.fields.residencyStatus.options.filter(option => {
                return  option.fields.id.value === form.controls.residencyStatus.value;
            })[0];

            beneficiary.fields.nationalIds.value[0].fields.type.value =
                beneficiary.fields.nationalIds.value[0].fields.type.options.filter(option => {
                    return form.controls.IDType.value === option.fields.id.value;
                })[0];
            beneficiary.fields.nationalIds.value[0].fields.number.value = form.controls.IDNumber.value;

            beneficiary.fields.phones.value[0].fields.type.value = beneficiary.fields.phones.value[0].fields.type.options.filter(
                type => type.fields.id.value === form.controls.phoneType0.value
            );
            beneficiary.fields.phones.value[1].fields.type.value = beneficiary.fields.phones.value[1].fields.type.options.filter(
                type => type.fields.id.value === form.controls.phoneType1.value
            );
            beneficiary.fields.phones.value[0].fields.number.value = form.controls.phoneNumber0.value;
            beneficiary.fields.phones.value[1].fields.number.value = form.controls.phoneNumber1.value;
            beneficiary.fields.phones.value[0].fields.proxy.value = form.controls.phoneProxy0.value;
            beneficiary.fields.phones.value[1].fields.proxy.value = form.controls.phoneProxy1.value;
            beneficiary.fields.phones.value[0].fields.prefix.value =
                form.controls.phonePrefix0.value ?
                form.controls.phonePrefix0.value.split('- ')[1] :
                null;
            beneficiary.fields.phones.value[1].fields.prefix.value =
                form.controls.phonePrefix1.value ?
                form.controls.phonePrefix1.value.split('- ')[1] :
                null;

            beneficiary.fields.vulnerabilities.value = this.vulnerabilityList.filter((vulnerability: VulnerabilityCriteria) => {
                return form.controls[vulnerability.fields.name.value].value === true;
            });
            beneficiaries.push(beneficiary);
        });

        this.household.fields.beneficiaries.value = beneficiaries;

        const body = {
            household: this.household.modelToApi(),
            projects: this.household.fields.projects.value.map(project => project.fields.id.value)
        };

        this.validationLoading = true;

        if (this.mode === 'create') {
            this._householdsService.create(body).subscribe(success => {
                this.snackbar.success(this.Text.update_beneficiary_created_successfully);
                this.validationLoading = false;
                this.leave();
            }, error => {
                this.snackbar.error(this.Text.update_beneficiary_error_creating + error);
                this.validationLoading = false;
            });
        } else if (this.mode === 'update') {
            this._householdsService.update(this.household.fields.id.value, body).subscribe(success => {
                this.snackbar.success(this.Text.update_beneficiary_updated_successfully);
                this.validationLoading = false;
                this.leave();
            }, error => {
                this.snackbar.error(this.Text.update_beneficiary_error_updated + error);
                this.validationLoading = false;
            });
        }
    }

    /**
     * Call backend to update the selected household with filled data.
     */
    update() {
        // console.log(this.mainForm)
        // console.log(this.beneficiariesForm)

        // if (this.updatedHousehold.projects.length === 0) {
        //     this.snackbar.error('You must select at least one project');
        //     return;
        // }

        // const body = this.formatHouseholdForApi();

        // const selectedProjectsIds = new Array<string>();
        // this.updatedHousehold.projects.forEach(
        //     project => {
        //         selectedProjectsIds.push(project.split(' - ')[0]);
        //     }
        // );
        // if (body) {
        //     this.validationLoading = true;
        //     this._householdsService.edit(this.updateId, body, selectedProjectsIds).toPromise()
        //         .then(
        //             success => {
        //                 if (success) {
        //                     this.snackbar.success(this.Text.update_beneficiary_updated_successfully);
        //                     this.leave();
        //                 } else {
        //                     this.validationLoading = false;
        //                 }
        //             }
        //         )
        //         .catch(
        //             error => {
        //                 this.snackbar.error(this.Text.update_beneficiary_error_updated + error);
        //                 this.validationLoading = false;
        //             }
        //         );
        // }
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

        // if (step === 0) {
        //     stepper.selectedIndex = 0;
        // }

        if (step === 1 || final) {
            // const hh = this.updatedHousehold;

            if (!this.mainForm.controls.adm1.value) {
                message = 'You must select a location';
            } else if (!this.mainForm.controls.addressNumber.value) {
                message = 'You must enter an address number';
            } else if (!this.mainForm.controls.addressPostcode.value) {
                message = 'You must enter an address postcode';
            } else if (!this.mainForm.controls.addressStreet.value) {
                message = 'You must enter an address street';
            } else if (this.mainForm.controls.livelihood.value && (this.mainForm.controls.livelihood.value > this.livelihoodsList.length)) {
                message = 'Please select an existing livelihood from the list';
            } else {
                this.validStep1 = true;
                if (step <= 1) { stepper.next(); }
                if (final) { validSteps++; }
            }
        }
        if (step === 2 || final) {
            const messageHeadValidation = this.validateBeneficiaryForm(0);

            if (messageHeadValidation === '') {
                this.validStep2 = true;
                if (step <= 2) { stepper.next(); }
                if (final) { validSteps++; }
            } else {
                message = messageHeadValidation;
            }
        }
        if (step === 3 || final) {
            let counter = 1;
            let gotError = false;

            for (let i = 1; i < this.beneficiariesForm.length && !gotError; i++) {
                gotError = true;

                const messageMemberValidation = this.validateBeneficiaryForm(i);

                if (messageMemberValidation === '') {
                    gotError = false;
                    counter++;
                } else {
                    message = messageMemberValidation;
                }
            }
            if (counter === this.beneficiariesForm.length) {
                if (step <= 3) { stepper.next(); }
                if (final) { validSteps++; }
                this.validStep3 = true;
            }
        }

        if (final) {
            return (validSteps === 3);
        } else if (message !== '') {
            this.snackbar.error(message);
        }

        return (false);
    }

    validateBeneficiaryForm(formIndex: number) {
        const beneficiary = this.beneficiariesForm[formIndex].controls;
        let message = '';
        const beneficiaryName =
            formIndex === 0 ?
            'the head of household' :
            'the ' + formIndex + this.getNumberSuffix(formIndex) + ' member';

        if (!beneficiary.familyName.value) {
            message = 'You must enter a family name for ' + beneficiaryName;
        } else if (!beneficiary.givenName.value) {
            message = 'You must enter a given name for ' + beneficiaryName;
        } else if (beneficiary.gender.value === null) {
            message = 'You must select a gender for ' + beneficiaryName;
        } else if (
            (beneficiary.phoneNumber0.value && isNaN(Number(beneficiary.phoneNumber0.value))) ||
            (beneficiary.phoneNumber1.value && isNaN(Number(beneficiary.phoneNumber1.value)))
        ) {
            message = 'Phone can only be composed by digits for ' + beneficiaryName;
        } else if (
            (beneficiary.phoneNumber0.value && beneficiary.phonePrefix0.value &&
                !this.elementExists(beneficiary.phonePrefix0.value, this.countryCodesList)) ||
            (beneficiary.phoneNumber1.value && beneficiary.phonePrefix1.value &&
                !this.elementExists(beneficiary.phonePrefix1.value, this.countryCodesList))
        ) {
            message = 'Please select an existing country code from the list for ' + beneficiaryName;
        } else if (
            (beneficiary.phoneNumber0.value && !beneficiary.phonePrefix0.value) ||
            (beneficiary.phoneNumber0.value && beneficiary.phonePrefix0.value === '') ||
            (beneficiary.phoneNumber1.value && !beneficiary.phonePrefix1.value) ||
            (beneficiary.phoneNumber1.value && beneficiary.phonePrefix1.value === '')
        ) {
            message = 'Please select a country code for the phone number for ' + beneficiaryName;
        } else if (beneficiary.dateOfBirth.value && beneficiary.dateOfBirth.value.getTime() > (new Date()).getTime()) {
            message = 'Please select a valid birth date for ' + beneficiaryName;
        }
        return message;
    }

    getNumberSuffix(number) {
        if (number === 1) {
            return 'st';
        } else if (number === 2) {
            return 'nd';
        } if (number === 3) {
            return 'rd';
        } else {
            return 'th';
        }
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


        // getting the full adms corresponding to the mainForm adms values (ids)
        const adms = ['adm1', 'adm2', 'adm3', 'adm4'].map(adm => {
            // We look in the list of adms which one correspond to the mainForm id
            return this.household.fields.location.value.fields[adm].options ?
                this.household.fields.location.value.fields[adm].options.filter(option => {
                    return option.fields.id.value === this.mainForm.controls[adm].value;
                })[0] :
                null;
        });

        if (adms[0]) {
            fullLocation = adms[0].fields.name.value;
        }
        if (adms[1]) {
            fullLocation += ', ' + adms[1].fields.name.value;
        }
        if (adms[2]) {
            fullLocation += ', ' + adms[2].fields.name.value;
        }
        if (adms[3]) {
            fullLocation += ', ' + adms[3].fields.name.value;
        }
        return (fullLocation);
    }

    getLivelihood() {
        return this.livelihoodsList.filter(livelihood => {
            return livelihood.id === this.mainForm.controls.livelihood.value;
        })[0];
    }

    /**
     * Get list of all country codes and put it in the list
     */
    getCountryPhoneCodes() {
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
            this.household.fields.projects.options = response.map(project => Project.apiToModel(project));
            // this.projectList = [];
            // const responseProject = Project.formatArray(response);
            // responseProject.forEach(element => {
            //     const concat = element.id + ' - ' + element.name;
            //     this.projectList.push(concat);
            // });
        });
    }

    /**
     * Get list of all Province (adm1) and put it in the province selector
     */
    loadProvince() {

        return this._locationService.fillAdm1Options(this.household).pipe(
            map(() => {
            this.mainForm.controls.adm2.setValue(null);
            this.mainForm.controls.adm3.setValue(null);
            this.mainForm.controls.adm4.setValue(null);
        }));

        // this.provinceList = [];
        // this.districtList = [];
        // this.communeList = [];
        // this.villageList = [];
        // this._locationService.getAdm1().subscribe(response => {
        //     this.provinceList = [];
        //     const responseAdm1 = Location.formatAdm(response);
        //     responseAdm1.forEach(element => {
        //         this.provinceList.push(element);
        //     });
        // });
    }

    /**
     * Get list of all District (adm2) and put it in the district selector
     */
    loadDistrict(adm1Id: number) {
        if (adm1Id) {
            this._locationService.fillAdm2Options(this.household, adm1Id).subscribe(() => {
                this.mainForm.controls.adm2.setValue(null);
                this.mainForm.controls.adm3.setValue(null);
                this.mainForm.controls.adm4.setValue(null);
            });
        }

        // this.districtList = [];
        // this.communeList = [];
        // this.villageList = [];
        // const body = {};
        // body['adm1'] = adm1;
        // this._locationService.getAdm2(body).subscribe(response => {
        //     this.districtList = [];
        //     const responseAdm2 = Location.formatAdm(response);
        //     responseAdm2.forEach(element => {
        //         this.districtList.push(element);
        //     });
        // });
    }

    /**
     * Get list of all Commune (adm3) and put it in the commune selector
     */
    loadCommune(adm2Id: number) {
        if (adm2Id) {
            this._locationService.fillAdm3Options(this.household, adm2Id).subscribe(() => {
                this.mainForm.controls.adm3.setValue(null);
                this.mainForm.controls.adm4.setValue(null);
            });
        }
        // this.communeList = [];
        // this.villageList = [];
        // const body = {};
        // body['adm2'] = adm2;
        // this._locationService.getAdm3(body).subscribe(response => {
        //     this.communeList = [];
        //     const responseAdm3 = Location.formatAdm(response);
        //     responseAdm3.forEach(element => {
        //         this.communeList.push(element);
        //     });
        // });
    }

    /**
     * Get list of all Vilage (adm4) and put it in the village selector
     */
    loadVillage(adm3Id: number) {
        if (adm3Id) {
            this._locationService.fillAdm4Options(this.household, adm3Id).subscribe(() => {
                this.mainForm.controls.adm4.setValue(null);
            });
        }
        // this.villageList = [];
        // const body = {};
        // body['adm3'] = adm3;
        // this._locationService.getAdm4(body).subscribe(response => {
        //     this.villageList = [];
        //     const responseAdm4 = Location.formatAdm(response);
        //     responseAdm4.forEach(element => {
        //         this.villageList.push(element);
        //     });
        // });
    }

    /**
     * Get list of all Vulnerabilities
     */
    getVulnerabilityCriteria() {
        return this._criteriaService.getVulnerabilityCriteria().pipe(
            map(response => {
                    this.vulnerabilityList = response.map(criteria => {
                        return VulnerabilityCriteria.apiToModel(criteria);
                    });
                    // const responseCriteria = Criteria.formatArray(response);
                    // responseCriteria.forEach(element => {
                    //     this.vulnerabilityList.push(element);
                    // });
                })
        );
    }

    /**
     * Get list of field and type of all country specifics
     */
    getCountrySpecifics() {
            return this._countrySpecificsService.get().pipe(
                map((countrySpecifics) => {
                    this.household.fields.countrySpecificAnswers.value = countrySpecifics.map(countrySpecific => {
                        const countrySpecificAnswer = new CountrySpecificAnswer();
                        countrySpecificAnswer.fields.countrySpecific.value = CountrySpecific.apiToModel(countrySpecific);
                        return countrySpecificAnswer;
                    });
                })
            );



        // const promise = this._countrySpecificsService.get();
        // if (promise) {
        //     return promise.pipe(
        //         map(response => {
        //             const countrySpecificsList = [];

        //             const responseCountrySpecifics = CountrySpecific.formatArray(response);
        //             responseCountrySpecifics.forEach(element => {
        //                 countrySpecificsList.push(
        //                     {
        //                         answer: '',
        //                         countryIso3: this.countryISO3,
        //                         field_string: element.field,
        //                         id: element.id,
        //                         type: element.type,
        //                         name: element.name,
        //                     }
        //                 );
        //             });
        //             return countrySpecificsList;
        //         }));
        // }
    }



    // For update, inspire from the function below (should already work)
    getPhonePrefix(phone: Phone) {
        let phoneCode;

        if (phone.fields.prefix.value) {
            const phonePrefix = phone.fields.prefix.value;
            return this.countryCodesList.filter(element => {
                return element.split('- ')[1] === phonePrefix;
            })[0];
        } else {
            phoneCode = String(this.getCountryISO2(String(this.countryISO3)));
            phoneCode = phoneCode + ' - '
                + '+' + this.CodesMethods.getCountryCodeForRegion(phoneCode);

            return this.countryCodesList.includes(phoneCode) ? phoneCode : null;
        }
    }

    /**
     * Set default phone code depending on the user adm1 country
     */
    getUserPhoneCode(beneficiary?: any) {

        if (this.countryISO3) {
            if (beneficiary && typeof beneficiary === 'string') { // means the 'beneficiary' is a 'phone prefix', would not be bad to type
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
        this.uneditedSnapshot = this.deepCopy(this.household);
        // this.uneditedSnapshot = this.deepCopy(this.updatedHousehold);
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
