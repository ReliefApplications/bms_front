import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog, MatStepper, MatTableDataSource, MAT_DATE_FORMATS } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalConfirmationComponent } from 'src/app/components/modals/modal-confirmation/modal-confirmation.component';
import { CountrySpecificService } from 'src/app/core/api/country-specific.service';
import { CriteriaService } from 'src/app/core/api/criteria.service';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { LocationService } from 'src/app/core/api/location.service';
import { PhoneService } from 'src/app/core/api/phone.service';
import { ProjectService } from 'src/app/core/api/project.service';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Address } from 'src/app/models/address';
import { Beneficiary, BeneficiaryOptions, BeneficiaryReferralType, Gender } from 'src/app/models/beneficiary';
import { Camp } from 'src/app/models/camp';
import { CampAddress } from 'src/app/models/camp-address';
import { PHONECODES } from 'src/app/models/constants/phone-codes';
import { CountrySpecific, CountrySpecificAnswer } from 'src/app/models/country-specific';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { Household, Livelihood } from 'src/app/models/household';
import { HouseholdLocation, HouseholdLocationGroup, HouseholdLocationType } from 'src/app/models/household-location';
import { Adm, Location } from 'src/app/models/location';
import { NationalId, NationalIdType } from 'src/app/models/national-id';
import { Phone, PhoneType } from 'src/app/models/phone';
import { Profile } from 'src/app/models/profile';
import { Project } from 'src/app/models/project';
import { VulnerabilityCriteria } from 'src/app/models/vulnerability-criteria';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';


@Component({
    selector: 'app-update-beneficiary',
    templateUrl: './update-beneficiary.component.html',
    styleUrls: ['./update-beneficiary.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class UpdateBeneficiaryComponent implements OnInit, DesactivationGuarded, OnDestroy {

    // Mode
    public mode: string;
    public locationSuscribers: Subscription[] = [];

    // Loaders
    public validationLoading = false;
    public loader = true;

    // Forms
    public mainFields: string[];
    public mainForm = new FormGroup({});
    public beneficiaryFields: string[];
    public beneficiariesForm: FormGroup[] = [];

    // NgSelect Lists
    public countryCodesList = PHONECODES;
    public provinceList = [];
    public districtList = [];
    public communeList = [];
    public villageList = [];
    public vulnerabilityList: Array<VulnerabilityCriteria>;
    public campLists = { 'current': [], 'resident': [] };
    public countrySpecificList = [];

    // Checkpoint
    validStep1 = false;
    validStep2 = false;
    validStep3 = false;

    // Table
    public tableColumns: string[] = ['localGivenName', 'localFamilyName', 'gender', 'dateOfBirth', 'phone', 'nationalId'];
    public tableData: MatTableDataSource<any>;

    // Edit watcher
    private uneditedHouseholdSnapshot: any;
    private uneditedBeneficiariesSnapshot: any;

    // Language and country
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;
    public countryId = this.countryService.selectedCountry.get<string>('id') ?
        this.countryService.selectedCountry.get<string>('id') :
        this.countryService.khm.get<string>('id');

    // Reference models
    public household: Household;
    public locations = { 'current': new Location(), 'resident': new Location() };
    public initialAdms: any = {};

    @ViewChild(MatStepper) stepper: MatStepper;

    constructor(
        public route: ActivatedRoute,
        public _projectService: ProjectService,
        public _locationService: LocationService,
        public _criteriaService: CriteriaService,
        public _countrySpecificsService: CountrySpecificService,
        public _cacheService: AsyncacheService,
        public _householdsService: HouseholdsService,
        public formBuilder: FormBuilder,
        public dialog: MatDialog,
        public snackbar: SnackbarService,
        public router: Router,
        public languageService: LanguageService,
        public countryService: CountriesService,
        public phoneService: PhoneService,
        public countrySpecificService: CountrySpecificService
    ) { }

    ngOnInit() {
        // Set right mode (update or create)
        this.mode = this.router.url.split('/')[2] === 'update-beneficiary' ? 'update' : 'create';

        this.initiateHousehold().then(() => {
            this.getVulnerabilityCriteria().subscribe((response) => {
                if (response) {
                    this.fillFormFields();
                    this.makeMainForm();
                    this.household.get<Beneficiary[]>('beneficiaries').forEach((beneficiary: Beneficiary, index: number) => {
                        this.makeBeneficiaryForm(beneficiary, index);
                    });
                    this.beneficiarySnapshot();
                    this.loader = false;
                    this.getProjects();
                }
            });
        });
    }

    fillFormFields() {
        this.mainFields = ['locationDifferent', 'incomeLevel', 'livelihood', 'notes', 'projects',
            'foodConsumptionScore', 'copingStrategiesIndex'];

        const locationFields = [];
        const locationFieldSuffixes = ['AddressNumber', 'AddressPostcode', 'AddressStreet',
            'Type', 'Camp', 'TentNumber', 'NewCamp', 'CreateCamp'
        ];
        ['current', 'resident'].forEach((locationGroup: string) => {
            locationFieldSuffixes.forEach((formControlName: string) => {
                locationFields.push(locationGroup + formControlName);
            });
        });
        this.mainFields = this.mainFields.concat(locationFields);

        const vulnerabilityCriteriaNames = this.vulnerabilityList.map((vulnerability: VulnerabilityCriteria) => {
            return vulnerability.get<string>('name');
        });
        this.beneficiaryFields = [
            'id', 'localGivenName', 'localFamilyName', 'enGivenName', 'enFamilyName', 'gender', 'dateOfBirth',
            'IDType', 'IDNumber', 'residencyStatus', 'addReferral', 'referralType', 'referralComment',
            'phoneType0', 'phoneNumber0', 'phonePrefix0', 'phoneProxy0',
            'phoneType1', 'phoneNumber1', 'phonePrefix1', 'phoneProxy1'
        ];
        this.beneficiaryFields = this.beneficiaryFields.concat(vulnerabilityCriteriaNames);
    }

    ngOnDestroy() {
        this.locationSuscribers.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    /**
     * Gets or creates household
     */
    initiateHousehold() {
        return new Promise((resolve, reject) => {
            if (this.mode === 'create') {
                this.household = new Household();
                const currentLocation = new HouseholdLocation();
                const currentLocationGroup = new HouseholdLocationGroup('current', this.language.household_location_current_address);
                currentLocation.set('locationGroup', currentLocationGroup);
                this.household.set('currentHouseholdLocation', currentLocation);
                this.household.set('beneficiaries', [this.createNewBeneficiary()]);
                this.getCountrySpecifics().subscribe((response) => {
                    if (response) {
                        resolve();
                    }
                });
            }

            if (this.mode === 'update') {
                this.validStep1 = true;
                this.validStep2 = true;
                this.validStep3 = true;
                this.route.params.subscribe(result => {
                    if (result && result['id']) {
                        this._householdsService.getOne(result['id']).subscribe(household => {
                            if (household) {
                                this.household = Household.apiToModel(household);
                            }
                            resolve();
                        });
                    }
                });
            }
        });
    }

    //
    // ─── MAKE FORMS ─────────────────────────────────────────────────────────────────
    //

    makeMainForm() {
        this.mainFields.forEach((fieldName: string) => {
            // check if it is a field of beneficiary directly
            const field = this.household.fields[fieldName] ? this.household.fields[fieldName] : null;
            if (field && field.kindOfField === 'MultipleSelect') {
                const selectedOptions = this.household.get<CustomModel[]>(fieldName).map(option => option.get('id'));
                this.mainForm.addControl(fieldName, new FormControl(selectedOptions));
            } else {
                this.mainForm.addControl(fieldName, new FormControl(this.household.get(fieldName) ? this.household.get(fieldName) : null));
            }
        });
        this.mainForm.controls.livelihood.setValue(this.household.get('livelihood') ?
            this.household.get('livelihood').get('id') : null);
        this.makeLocationForm();

        this.countrySpecificService.get().subscribe((countrySpecifics: any) => {
            if (countrySpecifics) {
                this.countrySpecificList = countrySpecifics.map((countrySpecific: any) => CountrySpecific.apiToModel(countrySpecific));
                this.countrySpecificList.forEach((countrySpecific: CountrySpecific) => {
                    this.mainFields.push(countrySpecific.get<string>('field'));
                    const answer = this.household.get<CountrySpecificAnswer[]>('countrySpecificAnswers').filter(countrySpecificAnswer => {
                        return countrySpecificAnswer.get('countrySpecific').get<string>('field') === countrySpecific.get<string>('field');
                    })[0];
                    this.mainForm.addControl(
                        countrySpecific.get<string>('field'), new FormControl(answer ? answer.get<string>('answer') : null));
                });
            }
        });
    }

    makeLocationForm() {
        const householdLocations = [this.household.get<HouseholdLocation>('currentHouseholdLocation')];
        if (this.household.get<HouseholdLocation>('residentHouseholdLocation')) {
            householdLocations.push(this.household.get<HouseholdLocation>('residentHouseholdLocation'));
        }

        this.mainForm.controls.locationDifferent.setValue(householdLocations.length > 1 ? true : false, { emitEvent: false });
        this.mainForm.controls.currentCreateCamp.setValue(false);
        this.mainForm.controls.residentCreateCamp.setValue(false);

        const locations = {};
        householdLocations.forEach((householdLocation: HouseholdLocation) => {
            const prefix = householdLocation.get('locationGroup') &&
                householdLocation.get('locationGroup').get<string>('id') === 'resident' ? 'resident' : 'current';
            this.mainForm.controls[prefix + 'Type'].setValue(
                householdLocation.get('type') ? householdLocation.get('type').get('id') : null);


            if (householdLocation.get('address') && householdLocation.get('address').get('location')) {
                locations[prefix] = householdLocation.get('address').get('location');
                this.mainForm.controls[prefix + 'AddressNumber'].setValue(householdLocation.get('address').get('number'));
                this.mainForm.controls[prefix + 'AddressStreet'].setValue(householdLocation.get('address').get('street'));
                this.mainForm.controls[prefix + 'AddressPostcode'].setValue(householdLocation.get('address').get('postcode'));
            } else if (householdLocation.get('campAddress') &&
                householdLocation.get('campAddress').get('camp') &&
                householdLocation.get('campAddress').get('camp').get('location')
            ) {
                locations[prefix] = householdLocation.get('campAddress').get('camp').get('location');
                this.mainForm.controls[prefix + 'TentNumber'].setValue(householdLocation.get('campAddress').get('tentNumber'));
            }

        });
        this.initialAdms['current'] = {
            currentAdm1: locations['current'].get('adm1') ? locations['current'].get('adm1').get<number>('id') : null,
            currentAdm2: locations['current'].get('adm2') ? locations['current'].get('adm2').get<number>('id') : null,
            currentAdm3: locations['current'].get('adm3') ? locations['current'].get('adm3').get<number>('id') : null,
            currentAdm4: locations['current'].get('adm4') ? locations['current'].get('adm4').get<number>('id') : null,
        };
        this.initialAdms['resident'] = {
            residentAdm1: locations['resident'].get('adm1') ? locations['resident'].get('adm1').get<number>('id') : null,
            residentAdm2: locations['resident'].get('adm2') ? locations['resident'].get('adm2').get<number>('id') : null,
            residentAdm3: locations['resident'].get('adm3') ? locations['resident'].get('adm3').get<number>('id') : null,
            residentAdm4: locations['resident'].get('adm4') ? locations['resident'].get('adm4').get<number>('id') : null,
        };
    }

    makeBeneficiaryForm(beneficiary: Beneficiary, index: number) {
        const beneficiaryFormControls = {};
        this.beneficiaryFields.forEach((fieldName: string) => {
            // check if it is a field of beneficiary directly
            const field = beneficiary.fields[fieldName] ? beneficiary.fields[fieldName] : null;
            if (field && field.kindOfField === 'SingleSelect') {
                beneficiaryFormControls[fieldName] = new FormControl(
                    beneficiary.get(fieldName) instanceof CustomModel ? beneficiary.get(fieldName).get('id') : null
                );
            } else {
                beneficiaryFormControls[fieldName] = new FormControl(beneficiary.get(fieldName) ? beneficiary.get(fieldName) : null);
            }
        });

        // if the head has family names and this member doesn't, fill with the same family names
        ['localFamilyName', 'enFamilyName'].forEach((familyNameField: string) => {
            const headFamilyName = this.beneficiariesForm[0] ? this.beneficiariesForm[0].controls[familyNameField].value : null;
            if (beneficiaryFormControls[familyNameField] && !beneficiaryFormControls[familyNameField].value && headFamilyName) {
                beneficiaryFormControls[familyNameField].setValue(headFamilyName);
            }
        });

        // fill phones
        [0, 1].forEach((phoneIndex: number) => {
            const phone = beneficiary.get<Phone[]>('phones')[phoneIndex];
            if (phone) {
                beneficiaryFormControls['phoneType' + phoneIndex].setValue(phone.get('type') ? phone.get('type').get('id') : null);
                beneficiaryFormControls['phoneNumber' + phoneIndex].setValue(phone.get('number'));
                beneficiaryFormControls['phoneProxy' + phoneIndex].setValue(phone.get('proxy'));
                beneficiaryFormControls['phonePrefix' + phoneIndex].setValue(this.phoneService.getPhonePrefix(phone, this.countryId));
            }
        });

        beneficiaryFormControls['IDType'].setValue(beneficiary.get<NationalId[]>('nationalIds')[0].get('type').get('id'));
        beneficiaryFormControls['IDNumber'].setValue(beneficiary.get<NationalId[]>('nationalIds')[0].get('number'));

        beneficiary.get<VulnerabilityCriteria[]>('vulnerabilities').forEach(vulnerability => {
            beneficiaryFormControls[vulnerability.get<string>('name')].setValue(true);
        });

        beneficiaryFormControls['residencyStatus'].setValue(
            beneficiary.get('residencyStatus') ? beneficiary.get('residencyStatus').get('id') : null);

        const beneficiaryForm = new FormGroup(beneficiaryFormControls);

        if (this.beneficiariesForm[index]) {
            this.beneficiariesForm[index] = beneficiaryForm;
        } else {
            this.beneficiariesForm.push(beneficiaryForm);
        }
    }

    //
    // ─── CREATE AND REMOVE FORMS WHEN CREATING AND REMOVING BENEFICIARIES ───────────
    //

    createNewBeneficiary() {
        const beneficiary = new Beneficiary();
        beneficiary.set('profile', new Profile());
        beneficiary.set('nationalIds', [new NationalId()]);
        const phone1 = new Phone();
        const phone2 = new Phone();
        phone1.set('type', phone1.getOptions('type')[0]);
        phone2.set('type', phone2.getOptions('type')[1]);
        beneficiary.set('phones', [phone1, phone2]);
        return beneficiary;
    }

    addBeneficiary() {
        const beneficiary = this.createNewBeneficiary();
        const index = this.beneficiariesForm.length;
        this.makeBeneficiaryForm(beneficiary, index);
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

    getBeneficiaryOptions(): BeneficiaryOptions {
        return {
            vulnerabilityList: this.vulnerabilityList,
            countryCodesList: this.countryCodesList,
            genderList: this.household.get<Beneficiary[]>('beneficiaries')[0].getOptions('gender'),
            nationalIdList: this.household.get<Beneficiary[]>('beneficiaries')[0].get<NationalId[]>('nationalIds')[0].getOptions('type'),
            residencyStatusList: this.household.get<Beneficiary[]>('beneficiaries')[0].getOptions('residencyStatus'),
            phoneList: this.household.get<Beneficiary[]>('beneficiaries')[0].get<Phone[]>('phones')[0].getOptions('type'),
            referralTypeList: this.household.get<Beneficiary[]>('beneficiaries')[0].getOptions('referralType'),

        };
    }

    passHousehold() {
        this.tableData = new MatTableDataSource(this.beneficiariesForm);
    }

    //
    // ─── SUMBIT FUNCTIONS ───────────────────────────────────────────────────────────
    //

    /**
     * Call backend to create a new household with filled data.
     */
    submit() {
        const controls = this.mainForm.controls;
        if (controls.projects.value.length < 1) {
            this.snackbar.error(this.language.beneficiairy_error_project);
            return;
        }

        this.household.set('livelihood', this.getLivelihood());
        this.household.set('notes', controls.notes.value);
        this.household.set('incomeLevel', controls.incomeLevel.value);
        this.household.set('foodConsumptionScore', controls.foodConsumptionScore.value);
        this.household.set('copingStrategiesIndex', controls.copingStrategiesIndex.value);

        this.household.set('projects',
            this.household.getOptions('projects').filter((project: Project) => controls.projects.value.includes(project.get('id')))
        );

        const countrySpecificAnswers = [];
        // We push all the country specific answers, even null, so it's possible to delete one
        this.countrySpecificList.forEach((countrySpecific: CountrySpecific) => {
            const countrySpecificAnswer = new CountrySpecificAnswer();
            countrySpecificAnswer.set('answer', controls[countrySpecific.get<string>('field')].value);
            countrySpecificAnswer.set('countrySpecific', countrySpecific);
            countrySpecificAnswers.push(countrySpecificAnswer);
        });
        this.household.set('countrySpecificAnswers', countrySpecificAnswers);

        this.fillLocationFromForm();
        this.fillBeneficiaryFromForms();

        const body = {
            household: this.household.modelToApi(),
            projects: this.household.get<Project[]>('projects').map(project => project.get('id'))
        };

        this.validationLoading = true;

        if (this.mode === 'create') {
            this._householdsService.create(body).subscribe((_success: any) => {
                this.snackbar.success(this.language.update_beneficiary_created_successfully);
                this.leave();
            }, error => {
                this.snackbar.error(this.language.update_beneficiary_error_creating + error);
                this.validationLoading = false;
            });
        } else if (this.mode === 'update') {
            this._householdsService.update(this.household.get('id'), body).subscribe((_success: any) => {
                this.snackbar.success(this.language.update_beneficiary_updated_successfully);
                this.leave();
            }, error => {
                this.validationLoading = false;
            });
        }
    }

    fillLocationFromForm() {
        const locationGroups = ['current', 'resident'];
        const controls = this.mainForm.controls;

        locationGroups.forEach((locationGroup: string) => {
            this.household.set(locationGroup + 'HouseholdLocation', null);
            if (locationGroup === 'current' || controls.locationDifferent.value) {
                const householdLocation = new HouseholdLocation();

                // fill the location group and type
                householdLocation.set('locationGroup', householdLocation.getOptions('locationGroup')
                    .filter((option: HouseholdLocationGroup) => option.get<string>('id') === locationGroup)[0]);
                const locationType = controls[locationGroup + 'Type'].value;
                householdLocation.set('type', householdLocation.getOptions('type')
                    .filter((option: HouseholdLocationType) => option.get<string>('id') === locationType)[0]);

                // fill the adms
                const location = this.locations[locationGroup];
                const admIndexes = ['1', '2', '3', '4'];
                admIndexes.forEach(index => {
                    const formControlName = locationGroup + 'Adm' + index;
                    location.set('adm' + index, controls[formControlName].value ?
                        location.getOptions('adm' + index).filter((option: Adm) => option.get('id') === controls[formControlName].value)[0]
                        : null);
                });

                // fill the address field according to the location type
                if (locationType !== 'camp') {
                    const address = new Address();
                    address.set('number', controls[locationGroup + 'AddressNumber'].value);
                    address.set('street', controls[locationGroup + 'AddressStreet'].value);
                    address.set('postcode', controls[locationGroup + 'AddressPostcode'].value);
                    address.set('location', location);
                    householdLocation.set('address', address);
                } else if (locationType === 'camp') {
                    const campAddress = new CampAddress();
                    let camp = new Camp();
                    if (controls[locationGroup + 'CreateCamp'].value) {
                        camp.set('name', controls[locationGroup + 'NewCamp'].value);
                    } else {
                        camp = this.campLists[locationGroup].filter((campFromList: Camp) =>
                            campFromList.get<string>('id') === controls[locationGroup + 'Camp'].value)[0];
                    }
                    camp.set('location', location);
                    campAddress.set('tentNumber', controls[locationGroup + 'TentNumber'].value);
                    campAddress.set('camp', camp);
                    householdLocation.set('campAddress', campAddress);
                }
                this.household.set(locationGroup + 'HouseholdLocation', householdLocation);
            }
        });
    }

    fillBeneficiaryFromForms() {
        const beneficiaries: Beneficiary[] = [];

        this.beneficiariesForm.forEach((form, index) => {
            const controls = form.controls;

            // get or create the corresponding beneficiary
            const beneficiary: Beneficiary = controls.id.value ?
                this.household.get<Beneficiary[]>('beneficiaries')
                    .filter(householdBeneficiary => householdBeneficiary.get('id') === controls.id.value)[0] :
                this.createNewBeneficiary();

            // fill the simple input and select fields
            ['localFamilyName', 'localGivenName', 'enFamilyName', 'enGivenName', 'dateOfBirth'].forEach((field: string) => {
                beneficiary.set(field, controls[field].value);
            });
            ['gender', 'residencyStatus'].forEach((field: string) => {
                beneficiary.set(field, beneficiary.getOptions(field).filter((option) => option.get('id') === controls[field].value)[0]);
            });

            // fill the particular fields
            const beneficiaryStatusOptions = beneficiary.getOptions('beneficiaryStatus');
            beneficiary.set('beneficiaryStatus', index === 0 ? beneficiaryStatusOptions[1] : beneficiaryStatusOptions[0]);
            beneficiary.set('vulnerabilities', this.vulnerabilityList.filter((vulnerability: VulnerabilityCriteria) => {
                return controls[vulnerability.get<string>('name')].value === true;
            }));

            // fill the national Id
            const nationalId = beneficiary.get<NationalId[]>('nationalIds')[0];
            nationalId.set('type',
                nationalId.getOptions('type').filter((option: NationalIdType) => controls.IDType.value === option.get('id'))[0]);
            nationalId.set('number', controls.IDNumber.value);
            beneficiary.set('nationalIds', [nationalId]);

            // fill the phones
            const phones = [];
            [0, 1].forEach((phoneIndex: number) => {
                const phone = beneficiary.get<Phone[]>('phones')[phoneIndex];
                phone.set('number', controls['phoneNumber' + phoneIndex].value);
                phone.set('proxy', controls['phoneProxy' + phoneIndex].value);
                const phoneType = controls['phoneType' + phoneIndex].value;
                phone.set('type', phoneType ? phone.getOptions('type').filter((type: PhoneType) => type.get('id') === phoneType)[0] : null);
                const phonePrefix = controls['phonePrefix' + phoneIndex].value;
                phone.set('prefix', phonePrefix ? phonePrefix.split('- ')[1] : null);
                phones.push(phone);
            });
            beneficiary.set('phones', phones);

            // fill the referral
            if (controls.referralComment.value && controls.referralType.value) {
                beneficiary.set('referralType', beneficiary.getOptions('referralType').filter((referralType: BeneficiaryReferralType) => {
                    return controls.referralType.value === referralType.get('id');
                })[0]);
                beneficiary.set('referralComment', controls.referralComment.value);
            }
            beneficiaries.push(beneficiary);
        });
        this.household.set('beneficiaries', beneficiaries);
    }

    //
    // ─── FORM VALIDATION FUNCTIONS ──────────────────────────────────────────────────
    //

    /**
     * Verify the needed forms before going next step : Blocks if any error (empty/bad type/format).
     */
    nextValidation(step: number, final?: boolean): boolean {
        let validSteps = 0;
        let message = '';
        if (!final) {
            final = false;
        }

        if (step === 1 || final) {
            const locationMessage = this.validateLocationForm();

            if (locationMessage === '') {
                this.validStep1 = true;
                this.stepper.selected.completed = true;
                if (step <= 1) { this.stepper.next(); }
                if (final) { validSteps++; }
            } else {
                message = locationMessage;
            }
        }
        if (step === 2 || final) {
            const messageHeadValidation = this.validateBeneficiaryForm(0);

            if (messageHeadValidation === '') {
                this.validStep2 = true;
                this.stepper.selected.completed = true;
                if (step <= 2) { this.stepper.next(); }
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
                this.stepper.selected.completed = true;
                if (step <= 3) { this.stepper.next(); }
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

    validateLocationForm() {
        let locationMessage = '';
        const locationGroups = ['current', 'resident'];
        const controls = this.mainForm.controls;

        locationGroups.forEach((locationGroup: string) => {
            if (locationGroup === 'current' || controls.locationDifferent.value) {
                if (!controls[locationGroup + 'Adm1'].value) {
                    locationMessage = this.language.beneficiary_error_location;
                } else if (!controls[locationGroup + 'Type'].value) {
                    locationMessage = this.language.beneficiairy_error_location_type;
                } else if (controls[locationGroup + 'Type'].value !== 'camp' && !controls[locationGroup + 'AddressNumber'].value) {
                    locationMessage = this.language.beneficiairy_error_address_number;
                } else if (controls[locationGroup + 'Type'].value !== 'camp' && !controls[locationGroup + 'AddressStreet'].value) {
                    locationMessage = this.language.beneficiary_error_address_street;
                } else if (controls[locationGroup + 'Type'].value !== 'camp' && !controls[locationGroup + 'AddressPostcode'].value) {
                    locationMessage = this.language.beneficiary_error_address_postcode;
                } else if (controls[locationGroup + 'Type'].value === 'camp' &&
                    ((!controls[locationGroup + 'CreateCamp'].value && !controls[locationGroup + 'Camp'].value) ||
                        (controls[locationGroup + 'CreateCamp'].value && !controls[locationGroup + 'NewCamp'].value))
                ) {
                    locationMessage = this.language.beneficiary_error_camp;
                } else if (controls[locationGroup + 'Type'].value === 'camp' && !controls.currentTentNumber.value) {
                    locationMessage = this.language.beneficiary_error_tent;
                }
            }
        });
        return locationMessage;

    }

    validateBeneficiaryForm(formIndex: number) {
        const beneficiary = this.beneficiariesForm[formIndex].controls;
        let message = '';
        const numberSuffix = formIndex <= 3 ? this.language.number_suffixes[formIndex] : this.language.number_suffix_other;
        const beneficiaryName = formIndex === 0 ? this.language.beneficiairy_error_head :
            this.language.the + ' ' + formIndex + numberSuffix + this.language.beneficiary_error_member;

        if (!beneficiary.localFamilyName.value) {
            message = this.language.beneficiary_error_family_name + beneficiaryName;
        } else if (!beneficiary.localGivenName.value) {
            message = this.language.beneficiary_error_given_name + beneficiaryName;
        } else if (beneficiary.gender.value === null) {
            message = this.language.beneficiairy_error_gender + beneficiaryName;
        } else if (
            (beneficiary.phoneNumber0.value && isNaN(Number(beneficiary.phoneNumber0.value))) ||
            (beneficiary.phoneNumber1.value && isNaN(Number(beneficiary.phoneNumber1.value)))
        ) {
            message = this.language.beneficiary_error_phone + beneficiaryName;
        } else if (
            (beneficiary.phoneNumber0.value && beneficiary.phonePrefix0.value &&
                !this.countryCodesList.includes(beneficiary.phonePrefix0.value)) ||
            (beneficiary.phoneNumber1.value && beneficiary.phonePrefix1.value &&
                !this.countryCodesList.includes(beneficiary.phonePrefix1.value))
        ) {
            message = this.language.beneficiary_error_existing_country_code + beneficiaryName;
        } else if (
            (beneficiary.phoneNumber0.value && (!beneficiary.phonePrefix0.value || beneficiary.phonePrefix0.value === '')) ||
            (beneficiary.phoneNumber1.value && (!beneficiary.phonePrefix1.value || beneficiary.phonePrefix1.value === ''))
        ) {
            message = this.language.beneficiary_error_country_code + beneficiaryName;
        } else if (!beneficiary.dateOfBirth.value || beneficiary.dateOfBirth.value.getTime() > (new Date()).getTime()) {
            message = this.language.beneficiairy_error_birth_date + beneficiaryName;
        }
        return message;
    }

    //
    // ─── FORMAT FIELDS TO DISPLAY IN SUMMARY ────────────────────────────────────────
    //


    getFullLocation(locationGroup) {
        // getting the adm names corresponding to the mainForm adm values (ids)
        const adms = ['1', '2', '3', '4'].map(admIndex => {
            // We look in the list of adms which one correspond to the mainForm id
            const options = this.locations[locationGroup].getOptions('adm' + admIndex);
            return options ?
                options.filter((option: Adm) => option.get('id') === this.mainForm.controls[locationGroup + 'Adm' + admIndex].value)[0] :
                null;
        });

        let fullLocation = '';
        fullLocation += adms[0] ? adms[0].get('name') : '';
        fullLocation += adms[1] ? ', ' + adms[1].get('name') : '';
        fullLocation += adms[2] ? ', ' + adms[2].get('name') : '';
        fullLocation += adms[3] ? ', ' + adms[3].get('name') : '';

        return (fullLocation);
    }

    getLivelihood() {
        return this.household.getOptions('livelihood').filter((livelihood: Livelihood) => {
            return livelihood.get('id') === this.mainForm.controls.livelihood.value;
        })[0];
    }

    getGender(id: string) {
        return id ?
            this.household.get<Beneficiary[]>('beneficiaries')[0].getOptions('gender').filter(
                (gender: Gender) => gender.get<string>('id') === id)[0].get('name') :
            null;
    }

    getCampName(locationGroup) {
        const campId = this.mainForm.controls[locationGroup + 'Camp'].value;
        return campId ? this.campLists[locationGroup].filter((camp: Camp) => camp.get('id') === campId)[0].get('name') : null;
    }

    //
    // ─── GET OPTIONS FROM THE API ───────────────────────────────────────────────────
    //

    /**
     * Get list of all project and put it in the project selector
     */
    getProjects() {
        this._projectService.get().subscribe(response => {
            if (response) {
                this.household.setOptions('projects', response.map(project => Project.apiToModel(project)));
            }
        });
    }

    /**
    * Get list of all Camps and put it in the camp selector
    */
    loadCamps(event: any) {
        this._locationService.getCamps(event.admType, event.admId).subscribe((camps) => {
            if (camps) {
                this.campLists[event.prefix] = camps.map((camp: any) => Camp.apiToModel(camp));
                const householdLocation = this.household.get(event.prefix + 'HouseholdLocation');
                if (householdLocation && householdLocation.get('campAddress') && householdLocation.get('campAddress').get('camp')) {
                    this.mainForm.controls[event.prefix + 'Camp'].setValue(householdLocation.get('campAddress').get('camp').get('id'));
                    this.snapshot();
                } else {
                    this.mainForm.controls[event.prefix + 'Camp'].setValue(null);
                }
            } else {
                this.campLists[event.prefix] = [];
                this.mainForm.controls[event.prefix + 'Camp'].setValue(null);
            }
        });
    }

    /**
     * Get list of all Vulnerabilities
     */
    getVulnerabilityCriteria() {
        return this._criteriaService.getVulnerabilityCriteria().pipe(
            map(response => {
                if (response) {
                    this.vulnerabilityList = response.map(criteria => VulnerabilityCriteria.apiToModel(criteria));
                }
                return response;
            })
        );
    }

    /**
     * Get list of field and type of all country specifics
     */
    getCountrySpecifics() {
        return this._countrySpecificsService.get().pipe(
            map((countrySpecifics) => {
                if (countrySpecifics) {
                    this.household.set('countrySpecificAnswers', countrySpecifics.map(countrySpecific => {
                        const countrySpecificAnswer = new CountrySpecificAnswer();
                        countrySpecificAnswer.set('countrySpecific', CountrySpecific.apiToModel(countrySpecific));
                        return countrySpecificAnswer;
                    }));
                }
                return countrySpecifics;
            })
        );
    }

    //
    // ─── VERIFY IF THE USER CAN LEAVE WITHOUT SAVING ────────────────────────────────
    //

    /**
     * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
     */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.checkIfFormHasBeenModified() && !this.validationLoading) {
            const dialogRef = this.dialog.open(ModalConfirmationComponent, {
                data: {
                    title: this.language.modal_leave,
                    sentence: this.language.modal_leave_sentence,
                    ok: this.language.modal_leave
                }
            });

            return dialogRef.afterClosed();
        } else {
            return (true);
        }
    }

    private checkIfFormHasBeenModified(): boolean {
        if (!this.mainForm) {
            return false;
        }
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
