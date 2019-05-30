import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog, MatStepper, MatTableDataSource, MAT_DATE_FORMATS } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import * as CountryIso from 'country-iso-3-to-2';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { Beneficiary, BeneficiaryOptions, Gender, ResidencyStatus } from 'src/app/models/beneficiary';
import { CountrySpecific, CountrySpecificAnswer } from 'src/app/models/country-specific';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { Household, Livelihood } from 'src/app/models/household';
import { Adm, Location } from 'src/app/models/location';
import { NationalId, NationalIdType } from 'src/app/models/national-id';
import { Phone, PhoneType } from 'src/app/models/phone';
import { Profile } from 'src/app/models/profile';
import { Project } from 'src/app/models/project';
import { VulnerabilityCriteria } from 'src/app/models/vulnerability-criteria';
import { ModalConfirmationComponent } from '../../../components/modals/modal-confirmation/modal-confirmation.component';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { CountrySpecificService } from '../../../core/api/country-specific.service';
import { CriteriaService } from '../../../core/api/criteria.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { LocationService } from '../../../core/api/location.service';
import { ProjectService } from '../../../core/api/project.service';
import { DesactivationGuarded } from '../../../core/guards/deactivate.guard';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { PHONECODES } from 'src/app/models/constants/phone-codes';
import { HouseholdLocation, HouseholdLocationGroup, HouseholdLocationType } from 'src/app/models/household-location';
import { Camp } from 'src/app/models/camp';
import { Address } from 'src/app/models/address';
import { CampAddress } from 'src/app/models/camp-address';
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

    public household: Household;
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
    public vulnerabilityList: Array<VulnerabilityCriteria>;
    public campLists = {
        'current': [],
        'resident': []
    };

    // Country Codes (PhoneNumber lib)
    private getCountryISO2 = CountryIso;
    public countryCodesList = PHONECODES;

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

    @ViewChild(MatStepper) stepper: MatStepper;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    public countryId = this.countryService.selectedCountry.getValue().get<string>('id') ?
        this.countryService.selectedCountry.getValue().get<string>('id') :
        this.countryService.khm.get<string>('id');

    // public location = new Location();
    public locations = {
        'current': new Location,
        'resident': new Location
    };

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
        public languageService: LanguageService,
        public countryService: CountriesService,
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
                const countrySpecificNames = this.household.get<CountrySpecificAnswer[]>('countrySpecificAnswers')
                    .map(countrySpecificAnswer => countrySpecificAnswer.get('countrySpecific').get<string>('field'));
                this.mainFields = [
                    'currentAdm1', 'currentAdm2', 'currentAdm3', 'currentAdm4', 'currentAddressNumber', 'currentCreateCamp',
                    'currentAddressPostcode', 'currentAddressStreet', 'currentType', 'currentCamp', 'currentTentNumber', 'currentNewCamp',
                    'residentAdm1', 'residentAdm2', 'residentAdm3', 'residentAdm4', 'residentAddressNumber', 'residentCreateCamp',
                    'residentAddressPostcode', 'residentAddressStreet', 'residentType', 'residentCamp',
                    'residentTentNumber', 'residentNewCamp', 'locationDifferent',
                    'incomeLevel', 'livelihood', 'notes', 'projects'];
                this.mainFields = this.mainFields.concat(countrySpecificNames);

                const vulnerabilityCriteriaNames = this.vulnerabilityList.map((vulnerability: VulnerabilityCriteria) => {
                    return vulnerability.get<string>('name');
                });
                this.beneficiaryFields = [
                    'id', 'localGivenName', 'localFamilyName', 'enGivenName', 'enFamilyName',
                    'gender', 'dateOfBirth', 'IDType', 'IDNumber', 'residencyStatus',
                    'phoneType0', 'phoneNumber0', 'phonePrefix0', 'phoneProxy0',
                    'phoneType1', 'phoneNumber1', 'phonePrefix1', 'phoneProxy1'];
                this.beneficiaryFields = this.beneficiaryFields.concat(vulnerabilityCriteriaNames);

                this.makeMainForm();
                this.household.get<Beneficiary[]>('beneficiaries')
                    .forEach((beneficiary: Beneficiary, index: number) => this.makeBeneficiaryForm(beneficiary, index));

                this.beneficiarySnapshot();
                this.loader = false;
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
                        this.household = new Household();
                        // this.household.set('location', new Location());
                        const currentLocation = new HouseholdLocation();
                        currentLocation.set('locationGroup',
                            new HouseholdLocationGroup('current', this.language.household_location_current_address));
                        const residentLocation = new HouseholdLocation();
                        residentLocation.set('locationGroup',
                            new HouseholdLocationGroup('resident', this.language.household_location_resident_address));
                        this.household.set('householdLocations', [currentLocation, residentLocation]);
                        this.household.set('beneficiaries', [this.createNewBeneficiary()]);
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
                        if (result && result['id']) {
                            this._householdsService.getOne(result['id']).subscribe(
                                household => {
                                    if (household) {
                                        this.household = Household.apiToModel(household);
                                    }
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
                const selectedOptions = this.household.get<CustomModel[]>(fieldName).map(option => {
                    return option.get('id');
                });
                mainFormControls[fieldName] = new FormControl(selectedOptions);
            } else {
                mainFormControls[fieldName] = new FormControl(
                    this.household.get(fieldName) ? this.household.get(fieldName) : null,
                );
            }
        });

        this.household.get<CountrySpecificAnswer[]>('countrySpecificAnswers').forEach(countrySpecificAnswer => {
            mainFormControls[countrySpecificAnswer.get('countrySpecific').get<string>('field')]
                .setValue(countrySpecificAnswer.get('answer'));
        });

        mainFormControls['livelihood'].setValue(this.household.get('livelihood') ? this.household.get('livelihood').get('id') : null);

        this.mainForm = new FormGroup(mainFormControls);

        // const location = this.household.get('location');
        const householdLocations = this.household.get<HouseholdLocation[]>('householdLocations');

        mainFormControls['locationDifferent'].setValue(householdLocations.length > 1 ? true : false);

        mainFormControls['currentCreateCamp'].setValue(false);
        mainFormControls['residentCreateCamp'].setValue(false);

        householdLocations.forEach((householdLocation: HouseholdLocation) => {
            const prefix = householdLocation.get('locationGroup') &&
                householdLocation.get('locationGroup').get<string>('id') === 'resident' ? 'resident' : 'current';
            mainFormControls[prefix + 'Type'].setValue(householdLocation.get('type') ? householdLocation.get('type').get('id') : null);

            if (householdLocation.get('address') && householdLocation.get('address').get('location')) {
                this.locations[prefix] = householdLocation.get('address').get('location');
                mainFormControls[prefix + 'AddressNumber'].setValue(householdLocation.get('address').get('number'));
                mainFormControls[prefix + 'AddressStreet'].setValue(householdLocation.get('address').get('street'));
                mainFormControls[prefix + 'AddressPostcode'].setValue(householdLocation.get('address').get('postcode'));
            } else if (householdLocation.get('campAddress') &&
                householdLocation.get('campAddress').get('camp') &&
                householdLocation.get('campAddress').get('camp').get('location')) {
                this.locations[prefix] = householdLocation.get('campAddress').get('camp').get('location');
                mainFormControls[prefix + 'Camp'].setValue(householdLocation.get('campAddress').get('camp').get('id'));
                mainFormControls[prefix + 'TentNumber'].setValue(householdLocation.get('campAddress').get('tentNumber'));
            }

            this.loadProvince(prefix).subscribe(() => {
                if (!this.locations[prefix].get('adm1') || !this.locations[prefix].get('adm1').get('id')) {
                    this.snapshot();
                    return;
                }
                const adm1Id = this.locations[prefix].get('adm1').get<number>('id');
                mainFormControls[prefix + 'Adm1'].setValue(adm1Id);
                this.loadCamps(prefix, 'adm1', adm1Id);
                this._locationService.fillAdm2Options(this.locations[prefix], adm1Id).subscribe(() => {
                    if (!this.locations[prefix].get('adm2') || !this.locations[prefix].get('adm2').get('id')) {
                        this.snapshot();
                        return;
                    }
                    const adm2Id = this.locations[prefix].get('adm2').get<number>('id');
                    mainFormControls[prefix + 'adm2'].setValue(adm2Id);
                    this.loadCamps(prefix, 'adm2', adm2Id);
                    this._locationService.fillAdm3Options(this.locations[prefix], adm2Id).subscribe(() => {
                        if (!this.locations[prefix].get('adm3') || !this.locations[prefix].get('adm3').get('id')) {
                            this.snapshot();
                            return;
                        }
                        const adm3Id = this.locations[prefix].get('adm3').get<number>('id');
                        mainFormControls[prefix + 'adm3'].setValue(adm3Id);
                        this.loadCamps(prefix, 'adm3', adm3Id);
                        this._locationService.fillAdm4Options(this.locations[prefix], adm3Id).subscribe(() => {
                            if (!this.locations[prefix].get('adm4')) {
                                this.snapshot();
                                return;
                            }
                            mainFormControls[prefix + 'adm4'].setValue(this.locations[prefix].get('adm4').get('id'));
                            this.loadCamps(prefix, 'adm4', this.locations[prefix].get('adm4').get('id'));

                            this.snapshot();
                        });
                    });
                });
            });
        });
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
                beneficiaryFormControls[fieldName] = new FormControl(
                    beneficiary.get(fieldName) ? beneficiary.get(fieldName) : null,
                );
            }
            if ( beneficiaryFormControls['localFamilyName'] &&
                !beneficiaryFormControls['localFamilyName'].value &&
                this.beneficiariesForm[0] &&
                this.beneficiariesForm[0].controls['localFamilyName'].value
            ) {
                beneficiaryFormControls['localFamilyName'].setValue(this.beneficiariesForm[0].controls['localFamilyName'].value);
            }
            if ( beneficiaryFormControls['enFamilyName'] &&
                !beneficiaryFormControls['enFamilyName'].value &&
                this.beneficiariesForm[0] &&
                this.beneficiariesForm[0].controls['enFamilyName'].value
            ) {
                beneficiaryFormControls['enFamilyName'].setValue(this.beneficiariesForm[0].controls['enFamilyName'].value);
            }
        });

        const phone0 = beneficiary.get<Phone[]>('phones')[0];
        const phone1 = beneficiary.get<Phone[]>('phones')[1];

        if (phone0) {
            beneficiaryFormControls['phoneType0'].setValue(phone0.get('type') ? phone0.get('type').get('id') : null);
            beneficiaryFormControls['phoneNumber0'].setValue(phone0.get('number'));
            beneficiaryFormControls['phoneProxy0'].setValue(phone0.get('proxy'));
            beneficiaryFormControls['phonePrefix0'].setValue(this.getPhonePrefix(phone0));
        }

        if (phone1) {
            beneficiaryFormControls['phoneType1'].setValue(phone1.get('type') ? phone1.get('type').get('id') : null);
            beneficiaryFormControls['phoneNumber1'].setValue(phone1.get('number'));
            beneficiaryFormControls['phoneProxy1'].setValue(phone1.get('proxy'));
            beneficiaryFormControls['phonePrefix1'].setValue(this.getPhonePrefix(phone1));
        }

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
            phoneList: this.household.get<Beneficiary[]>('beneficiaries')[0].get<Phone[]>('phones')[0].getOptions('type')

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
            this.snackbar.error(this.language.beneficiairy_error_project);
            return;
        }

        const locationGroups = ['current', 'resident'];

        const householdLocations = [];

        locationGroups.forEach((locationGroup: string) => {
            const locationType = this.mainForm.controls[locationGroup + 'Type'].value;
            const location = this.locations[locationGroup];
            const adms = ['1', '2', '3', '4'];

            adms.forEach(index => {
                if (this.mainForm.controls[locationGroup + 'Adm' + index].value) {
                    location.set('adm' + index,
                        location.getOptions('adm' + index).filter((option: Adm) => {
                            return option.get('id') === this.mainForm.controls[locationGroup + 'Adm' + index].value;
                        })[0]);
                } else {
                    location.set('adm' + index, null);
                }
            });

            // Never worked : asynchronous !!
            this._cacheService.get('country')
                .subscribe(
                    result => {
                        location.set('countryIso3', result);
                    }
                );

            const householdLocation = new HouseholdLocation();
            householdLocation.set('locationGroup', householdLocation.getOptions('locationGroup')
                .filter((option: HouseholdLocationGroup) => option.get<string>('id') === locationGroup)[0]);

            householdLocation.set('type', householdLocation.getOptions('type')
                .filter((option: HouseholdLocationType) =>
                    option.get<string>('id') === this.mainForm.controls[locationGroup + 'Type'].value)[0]);

            if (locationType !== 'camp') {
                const address = new Address();
                address.set('number', this.mainForm.controls[locationGroup + 'AddressNumber'].value);
                address.set('street', this.mainForm.controls[locationGroup + 'AddressStreet'].value);
                address.set('postcode', this.mainForm.controls[locationGroup + 'AddressPostcode'].value);
                address.set('location', location);
                householdLocation.set('address', address);
            } else if (locationType === 'camp') {
                const campAddress = new CampAddress();
                let camp = new Camp();
                if (this.mainForm.controls[locationGroup + 'CreateCamp'].value) {
                    camp.set('name', this.mainForm.controls[locationGroup + 'NewCamp'].value);
                } else {
                    camp = this.campLists[locationGroup]
                    .filter((campFromList: Camp) =>
                        campFromList.get<string>('id') === this.mainForm.controls[locationGroup + 'Camp'].value)[0];
                }
                camp.set('location', location);
                campAddress.set('tentNumber', this.mainForm.controls[locationGroup + 'TentNumber'].value);
                campAddress.set('camp', camp);
                householdLocation.set('campAddress', campAddress);
            }
            householdLocations.push(householdLocation);
        });


        this.household.set('householdLocations', householdLocations);
        this.household.set('livelihood', this.getLivelihood());
        this.household.set('notes', this.mainForm.controls.notes.value);
        this.household.set('incomeLevel', this.mainForm.controls.incomeLevel.value);

        this.household.set(
            'projects',
            this.household.getOptions('projects').filter((project: Project) => {
                return this.mainForm.controls.projects.value.includes(project.get('id'));
            })
        );

        this.household.get<CountrySpecificAnswer[]>('countrySpecificAnswers').forEach(countrySpecificAnswer => {
            countrySpecificAnswer.set('answer',
                this.mainForm.controls[countrySpecificAnswer.get('countrySpecific').get<string>('field')].value);
        });

        const beneficiaries: Beneficiary[] = [];

        this.beneficiariesForm.forEach((form, index) => {
            let beneficiary: Beneficiary;
            if (form.controls.id.value) {
                beneficiary = this.household.get<Beneficiary[]>('beneficiaries').filter(householdBeneficiary => {
                    return householdBeneficiary.get('id') === form.controls.id.value;
                })[0];
            } else {
                beneficiary = this.createNewBeneficiary();
            }

            beneficiary.set('localFamilyName', form.controls.localFamilyName.value);
            beneficiary.set('localGivenName', form.controls.localGivenName.value);
            beneficiary.set('enFamilyName', form.controls.enFamilyName.value);
            beneficiary.set('enGivenName', form.controls.enGivenName.value);
            beneficiary.set('dateOfBirth', form.controls.dateOfBirth.value);
            beneficiary.set('beneficiaryStatus', index === 0 ?
                beneficiary.getOptions('beneficiaryStatus')[1] : // Head
                beneficiary.getOptions('beneficiaryStatus')[0]); // Member
            beneficiary.set(
                'gender',
                beneficiary.getOptions('gender').filter((option: Gender) => {
                    return  option.get('id') === form.controls.gender.value;
                })[0]
            );
            beneficiary.set('residencyStatus', beneficiary.getOptions('residencyStatus').filter((option: ResidencyStatus) => {
                return  option.get('id') === form.controls.residencyStatus.value;
            })[0]);

            const nationalId = beneficiary.get<NationalId[]>('nationalIds')[0];
            nationalId.set('type',
                nationalId.getOptions('type').filter((option: NationalIdType) => {
                    return form.controls.IDType.value === option.get('id');
                })[0]);
            nationalId.set('number', form.controls.IDNumber.value);
            beneficiary.set('nationalIds', [nationalId]);

            const phone0 = beneficiary.get<Phone[]>('phones')[0];
            const phone1 = beneficiary.get<Phone[]>('phones')[1];

            phone0.set('type', form.controls.phoneType0.value ?
                phone0.getOptions('type').filter((type: PhoneType) => type.get('id') === form.controls.phoneType0.value)[0] :
                null);
            phone1.set('type', form.controls.phoneType1.value ?
                phone1.getOptions('type').filter((type: PhoneType) => type.get('id') === form.controls.phoneType1.value)[0] :
                null);

            phone0.set('number', form.controls.phoneNumber0.value);
            phone1.set('number', form.controls.phoneNumber1.value);
            phone0.set('proxy', form.controls.phoneProxy0.value);
            phone1.set('proxy', form.controls.phoneProxy1.value);
            phone0.set('prefix', form.controls.phonePrefix0.value ?
                form.controls.phonePrefix0.value.split('- ')[1] :
                null);
            phone1.set('prefix', form.controls.phonePrefix1.value ?
                form.controls.phonePrefix1.value.split('- ')[1] :
                null);

            beneficiary.set('phones', [phone0, phone1]);

            beneficiary.set('vulnerabilities', this.vulnerabilityList.filter((vulnerability: VulnerabilityCriteria) => {
                return form.controls[vulnerability.get<string>('name')].value === true;
            }));
            beneficiaries.push(beneficiary);
        });

        this.household.set('beneficiaries', beneficiaries);

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

        locationGroups.forEach((locationGroup: string) => {
            if (locationGroup === 'current' || this.mainForm.controls.locationDifferent.value) {
                if (!this.mainForm.controls[locationGroup + 'Adm1'].value) {
                    locationMessage = this.language.beneficiary_error_location;
                } else if (!this.mainForm.controls[locationGroup + 'Type'].value) {
                    locationMessage = this.language.beneficiairy_error_location_type;
                } else if (this.mainForm.controls[locationGroup + 'Type'].value !== 'camp' &&
                    !this.mainForm.controls[locationGroup + 'AddressNumber'].value) {
                    locationMessage = this.language.beneficiairy_error_address_number;
                } else if (this.mainForm.controls[locationGroup + 'Type'].value !== 'camp' &&
                    !this.mainForm.controls[locationGroup + 'AddressStreet'].value) {
                    locationMessage = this.language.beneficiary_error_address_street;
                } else if (this.mainForm.controls[locationGroup + 'Type'].value !== 'camp' &&
                    !this.mainForm.controls[locationGroup + 'AddressPostcode'].value) {
                    locationMessage = this.language.beneficiary_error_address_postcode;
                } else if (
                    this.mainForm.controls[locationGroup + 'Type'].value === 'camp' &&
                    ((!this.mainForm.controls[locationGroup + 'CreateCamp'].value &&
                        !this.mainForm.controls[locationGroup + 'Camp'].value) ||
                    (this.mainForm.controls[locationGroup + 'CreateCamp'].value &&
                        !this.mainForm.controls[locationGroup + 'NewCamp'].value))
                ) {
                    locationMessage = this.language.beneficiary_error_camp;
                } else if (this.mainForm.controls[locationGroup + 'Type'].value === 'camp' &&
                    !this.mainForm.controls.currentTentNumber.value) {
                    locationMessage = this.language.beneficiary_error_tent;
                }
            }

        });

        return locationMessage;

    }

    validateBeneficiaryForm(formIndex: number) {
        const beneficiary = this.beneficiariesForm[formIndex].controls;
        let message = '';
        const beneficiaryName =
            formIndex === 0 ?
            this.language.beneficiairy_error_head :
            this.language.the + ' ' + formIndex + this.getNumberSuffix(formIndex) + this.language.beneficiary_error_member;

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
            (beneficiary.phoneNumber0.value && !beneficiary.phonePrefix0.value) ||
            (beneficiary.phoneNumber0.value && beneficiary.phonePrefix0.value === '') ||
            (beneficiary.phoneNumber1.value && !beneficiary.phonePrefix1.value) ||
            (beneficiary.phoneNumber1.value && beneficiary.phonePrefix1.value === '')
        ) {
            message = this.language.beneficiary_error_country_code + beneficiaryName;
        } else if (!beneficiary.dateOfBirth.value || beneficiary.dateOfBirth.value.getTime() > (new Date()).getTime()) {
            message = this.language.beneficiairy_error_birth_date + beneficiaryName;
        }
        return message;
    }

    getNumberSuffix(number) {
        if (number === 1) {
            return this.language.number_suffix_first;
        } else if (number === 2) {
            return this.language.number_suffix_second;
        } if (number === 3) {
            return this.language.number_suffix_third;
        } else {
            return this.language.number_suffix_other;
        }
    }

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
            return this.household.get('location').getOptions(adm) ?
                this.household.get('location').getOptions(adm).filter((option: Adm) => {
                    return option.get('id') === this.mainForm.controls[adm].value;
                })[0] :
                null;
        });

        if (adms[0]) {
            fullLocation = adms[0].get('name');
        }
        if (adms[1]) {
            fullLocation += ', ' + adms[1].get('name');
        }
        if (adms[2]) {
            fullLocation += ', ' + adms[2].get('name');
        }
        if (adms[3]) {
            fullLocation += ', ' + adms[3].get('name');
        }
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

    changeAdm(event) {
        if (event.adm === 'adm1') {
            this.loadDistrict(event.type, event.id);
        } else if (event.adm === 'adm2') {
            this.loadCommune(event.type, event.id);
        } else if (event.adm === 'adm3') {
            this.loadVillage(event.type, event.id);
        } else if (event.adm === 'adm4') {
            this.loadCamps(event.type, event.adm, event.id);
        }
    }

    /**
     * Get list of all Province (adm1) and put it in the province selector
     */
    loadProvince(prefix: string) {
        return this._locationService.fillAdm1Options(this.locations[prefix]).pipe(
            map(() => {
            this.mainForm.controls[prefix + 'Adm2'].setValue(null);
            this.mainForm.controls[prefix + 'Adm3'].setValue(null);
            this.mainForm.controls[prefix + 'Adm4'].setValue(null);
        }));
    }

    /**
     * Get list of all District (adm2) and put it in the district selector
     */
    loadDistrict(prefix: string, adm1Id: number) {
        this.loadCamps(prefix, 'adm1', adm1Id);
        if (adm1Id) {
            this._locationService.fillAdm2Options(this.locations[prefix], adm1Id).subscribe(() => {
                this.mainForm.controls[prefix + 'Adm2'].setValue(null);
                this.mainForm.controls[prefix + 'Adm3'].setValue(null);
                this.mainForm.controls[prefix + 'Adm4'].setValue(null);
            });
        }
    }

    /**
     * Get list of all Commune (adm3) and put it in the commune selector
     */
    loadCommune(prefix: string, adm2Id: number) {
        this.loadCamps(prefix, 'adm2', adm2Id);
        if (adm2Id) {
            this._locationService.fillAdm3Options(this.locations[prefix], adm2Id).subscribe(() => {
                this.mainForm.controls[prefix + 'Adm3'].setValue(null);
                this.mainForm.controls[prefix + 'Adm4'].setValue(null);
            });
        }
    }

    /**
     * Get list of all Vilage (adm4) and put it in the village selector
     */
    loadVillage(prefix: string, adm3Id: number) {
        this.loadCamps(prefix, 'adm3', adm3Id);
        if (adm3Id) {
            this._locationService.fillAdm4Options(this.locations[prefix], adm3Id).subscribe(() => {
                this.mainForm.controls[prefix + 'Adm4'].setValue(null);
            });
        }
    }

     /**
     * Get list of all Camps and put it in the camp selector
     */
    loadCamps(prefix: string, admType: string, admId: number) {
        this._locationService.getCamps(admType, admId).subscribe((camps) => {
            if (camps) {
                this.campLists[prefix] = camps.map((camp: any) => Camp.apiToModel(camp));
                this.mainForm.controls[prefix + 'Camp'].setValue(null);
            } else {
                this.campLists[prefix] = [];
                this.mainForm.controls[prefix + 'Camp'].setValue(null);
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
                    this.vulnerabilityList = response.map(criteria => {
                        return VulnerabilityCriteria.apiToModel(criteria);
                    });
                }
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
            })
        );
    }



    // For update, inspire from the function below (should already work)
    getPhonePrefix(phone: Phone) {
        let phoneCode;
        const phonePrefix = phone.get<string>('prefix');

        if (phonePrefix) {
            return this.countryCodesList.filter(element => {
                return element.split('- ')[1] === phonePrefix;
            })[0];
        } else {
            const countryCode = String(this.getCountryISO2(String(this.countryISO3)));
            phoneCode = this.countryCodesList.filter(element => {
                return element.split(' -')[0] === countryCode;
            })[0];
            return phoneCode ? phoneCode : null;
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
