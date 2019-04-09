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

    // public headBeneficiary: Beneficiary;
    public beneficiaryFields: string[];
    public beneficiariesForm: FormGroup[] = [];

    // Household objects
    public countryISO3;
    public loader = true;

    // DB Lists
    public provinceList = [];
    public districtList = [];
    public communeList = [];
    public villageList = [];
    public livelihoodsList: any[];
    public vulnerabilityList: Array<VulnerabilityCriteria>;

    // Country Codes (PhoneNumber lib)
    private CodesMethods = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    private getCountryISO2 = require('country-iso-3-to-2');
    public countryCodesList = [];

    // Checkpoint
    validStep1 = false;
    validStep2 = false;
    validStep3 = false;

    // Table
    public tableColumns: string[] = ['givenName', 'familyName', 'gender', 'dateOfBirth', 'phone', 'nationalId'];
    public tableData: MatTableDataSource<any>;

    // Edit watcher
    private uneditedHouseholdSnapshot: any;
    private uneditedBeneficiariesSnapshot: any;

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
                this.household.fields.beneficiaries.value.forEach((beneficiary: Beneficiary) => {
                    this.makeBeneficiaryForm(beneficiary);
                });

                this.beneficiarySnapshot();
                this.loader = false;
                this.livelihoodsList = LIVELIHOOD;
                this.getProjects();
            });
        });
    }

    /**
     * Gets or creates household
     */
    initiateHousehold() {
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
                        this.household.fields.beneficiaries.value = [this.createNewBeneficiary()];
                        this.getCountrySpecifics().subscribe(() => {
                            resolve();
                        });
                    }
                );
            }

            if (this.mode === 'update') {
                this.validStep1 = true;
                this.validStep2 = true;
                this.validStep3 = true;
                this.route.params.subscribe(
                    result => {
                        if (result['id']) {
                            this._householdsService.getOne(result['id']).subscribe(
                                household => {
                                    this.getCountryPhoneCodes();
                                    this.household = Households.apiToModel(household);
                                    resolve();
                                }
                            );
                        }
                    }
                );
            }
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

        this.household.fields.countrySpecificAnswers.value.forEach(countrySpecificAnswer => {
            mainFormControls[countrySpecificAnswer.fields.countrySpecific.value.fields.field.value]
                .setValue(countrySpecificAnswer.fields.answer.value);
        });

        mainFormControls['livelihood'].setValue(this.household.fields.livelihood.value ? this.household.fields.livelihood.value.id : null);

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
                                        this.snapshot();
                                    } else {
                                        this.snapshot();
                                    }
                                });
                            } else {
                                this.snapshot();
                            }
                        });
                    } else {
                        this.snapshot();
                    }
                });
            } else {
                this.snapshot();
            }
        });

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

        beneficiaryFormControls['residencyStatus'].setValue(
            beneficiary.fields.residencyStatus.value ? beneficiary.fields.residencyStatus.value.fields.id.value : null);

        const beneficiaryForm = new FormGroup(beneficiaryFormControls);
        this.beneficiariesForm.push(beneficiaryForm);
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
        this.makeBeneficiaryForm(beneficiary);
    }

     /**
     * To delete a beneficiary form.
     * @param index
     */
    removeBeneficiary(beneficiaryForm: FormGroup) {

        const index = this.beneficiariesForm.indexOf(beneficiaryForm);
        if (index < this.beneficiariesForm.length) {
            this.beneficiariesForm.splice(index, 1);
        }
    }

    getBeneficiaryOptions(): Object {
        return {
            vulnerabilityList: this.vulnerabilityList,
            countryCodesList: this.countryCodesList,
            genderList: this.household.fields.beneficiaries.value[0].fields.gender.options,
            nationalIdList: this.household.fields.beneficiaries.value[0].fields.nationalIds.value[0].fields.type.options,
            residencyStatusList: this.household.fields.beneficiaries.value[0].fields.residencyStatus.options,
            phoneList: this.household.fields.beneficiaries.value[0].fields.phones.value[0].fields.type.options

        };
    }


    passHousehold() {
        this.tableData = new MatTableDataSource(this.beneficiariesForm);
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


            beneficiary.fields.phones.value[0].fields.type.value = form.controls.phoneType0.value ?
                beneficiary.fields.phones.value[0].fields.type.options.filter(
                    type => type.fields.id.value === form.controls.phoneType0.value
                )[0] :
                null;
            beneficiary.fields.phones.value[1].fields.type.value = form.controls.phoneType1.value ?
                beneficiary.fields.phones.value[1].fields.type.options.filter(
                    type => type.fields.id.value === form.controls.phoneType1.value
                )[0] :
                null;

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
     * Verify the needed forms before going next step : Blocks if any error (empty/bad type/format).
     */
    nextValidation(step: number, stepper: MatStepper, final?: boolean): boolean {
        let validSteps = 0;
        let message = '';
        if (!final) {
            final = false;
        }

        if (step === 1 || final) {

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
                !this.countryCodesList.includes(beneficiary.phonePrefix0.value)) ||
            (beneficiary.phoneNumber1.value && beneficiary.phonePrefix1.value &&
                !this.countryCodesList.includes(beneficiary.phonePrefix1.value))
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
        if (!this.checkEqualValues(this.mainForm.value, this.uneditedHouseholdSnapshot)) {
            return true;
        }
        const beneficiariesValue = this.beneficiariesForm.map(beneficiaryForm => beneficiaryForm.value);
        if (!this.checkEqualValues(beneficiariesValue, this.uneditedBeneficiariesSnapshot)) {
            return true;
        }
        return false;
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

    getGender(id) {
        return id ?
            this.household.fields.beneficiaries.value[0].fields.gender.options.filter(
                gender => gender.fields.id.value === id)[0].fields.name.value :
            null;
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
     * alow to return in household page and abort the creation of household
     */
    leave() {
        this.router.navigate(['/beneficiaries']);
    }

    private beneficiarySnapshot(): void {
        this.uneditedBeneficiariesSnapshot = this.beneficiariesForm.map(beneficiaryForm => this.deepCopy(beneficiaryForm.value));
    }

    private snapshot(): void {
        this.uneditedHouseholdSnapshot = this.deepCopy(this.mainForm.value);
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
