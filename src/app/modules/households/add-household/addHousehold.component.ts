import { Component, OnInit, HostListener, ViewChild, ViewChildren, asNativeElements, QueryList } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FormControl, Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { Location } from '../../../model/location';
import { LocationService } from '../../../core/api/location.service';
import { MatInput, MatSnackBar, MatStepper, getMatFormFieldPlaceholderConflictError } from '@angular/material';
import { CriteriaService } from '../../../core/api/criteria.service';
import { VulnerabilityCriteria } from '../../../model/vulnerability_criteria';
import { CountrySpecificService } from '../../../core/api/country-specific.service';
import { CountrySpecific, CountrySpecificAnswer } from '../../../model/country-specific';
import { Router } from '@angular/router';
import { HouseholdsService } from '../../../core/api/households.service';
import { AddHouseholds, AddBeneficiaries, Phones, NationalID } from '../../../model/add-household';
import { element } from 'protractor';

@Component({
  selector: 'add-household',
  templateUrl: './addHousehold.component.html',
  styleUrls: ['./addHousehold.component.scss']
})
export class AddHouseholdComponent implements OnInit {

  public nameComponent = "add_household_title";
  public household = GlobalText.TEXTS;

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChildren('countrySpecificsAnswer') CountrySpecificsInput: QueryList<MatInput>;

  //for the project selector
  public projects = new FormControl('', Validators.required);
  public projectList: string[] = [];
  public selectedProject: string = null;

  //for the gender selector
  // public gender = new FormControl();
  public genderList: string[] = ['F', 'M'];
  public selectedGender: string = null;

  //for the province selector
  public province = new FormControl('', Validators.required);
  public provinceList: string[] = [];
  public selectedProvince: string = null;

  //for the district selector
  public district = new FormControl();
  public districtList: string[] = [];
  public selectedDistrict: string = null;

  //for the commune selector
  public commune = new FormControl();
  public communeList: string[] = [];
  public selectedCommune: string = null;

  //for the village selector
  public village = new FormControl();
  public villageList: string[] = [];
  public selectedVillage: string = null;

  //for the type phone selector
  // public typePhone = new FormControl('type1');
  public typePhoneList: string[] = ['type1'];
  public selectedtypePhone: string = '';

  //for the type national id selector
  // public typeNationalId = new FormControl('card');
  public typeNationalIdList: string[] = ['type1', 'card'];
  public selectedtypeNationalId: string = '';

  //for other item which need to display with database information
  public allVulnerability = [];
  public countrySpecifics = [];
  public answerCountrySpecific;

  //for the address' input
  public addressNumber = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
  public addressStreet = new FormControl('', [Validators.pattern('[a-zA-Z ]*'), Validators.required]);
  public addressPostcode = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
  public selectedVulnerabilities = [];

  //This object will be fill and send to the back when button create is click
  public householdToCreate: AddHouseholds = new AddHouseholds;

  //For the reactive form in step 3
  public beneficiaryForm: FormGroup

  // public instantiateVulnerabilities: FormArray = new FormArray([]);


  constructor(
    public _projectService: ProjectService,
    public _locationService: LocationService,
    public snackBar: MatSnackBar,
    public _criteriaService: CriteriaService,
    public _countrySpecificsService: CountrySpecificService,
    public router: Router,
    public _householdsServce: HouseholdsService,
    public formBuilder: FormBuilder
  ) {


  }

  ngOnInit() {
    this.getProjects();
    this.getProvince();
    this.getVulnerabilityCriteria();
    console.log('vulnerability', this.allVulnerability);
    this.getCountrySpecifics();

    // this.initVulnerabilitiesForm();
    //create a new array with form control for all vulnerability
    // console.log(this.instantiateVulnerabilities);
    this.instantiateForm();
    console.log(this.beneficiaryForm.controls.beneficiary);
  }

  /**
   * Initiate the form structure
   */
  instantiateForm() {
    this.beneficiaryForm = this.formBuilder.group({
      beneficiary: this.formBuilder.array([
        this.formBuilder.group({
          familyName: '',
          givenName: '',
          gender: '',
          birth: '',
          typeNationalId: '',
          typePhone: '',
          // vulnerabilities: this.formBuilder.array([
          //   this.allVulnerability.forEach(element => {
          //     this.formBuilder.group({
          //       addControl(element)
          //     })
          //   })
          // ]),
          vulnerabilities: '',
          phone: '',
          nationalID: ''
        })
      ])
    })
  }

  /**
   * to get beneficiary form easily in html template
   */
  get beneficiary() {
    return this.beneficiaryForm.get('beneficiary') as FormArray;
  }

  addMoreBeneficiary() {
    let newBeneficiary = this.formBuilder.group({
      familyName: '',
      givenName: '',
      gender: '',
      birth: '',
      typeNationalId: '',
      typePhone: '',
      vulnerabilities: '',
      phone: '',
      nationalID: ''
    })
    this.beneficiary.push(newBeneficiary);
  }

  /**
   * Get country specific's element in the front to get thei placeholder and their value
   */
  ngAfterViewInit() {
    this.answerCountrySpecific = this.CountrySpecificsInput;
  }

  // initVulnerabilitiesForm() {
  //   console.log(this.allVulnerability)

  //   this.allVulnerability.forEach(element => {
  //     console.log(element)

  //     let formGroup = new FormGroup({});
  //     formGroup.addControl(element, new FormControl(false))
  //     this.instantiateVulnerabilities.push(formGroup);
  //   })
  // }

  /**
    * check if the langage has changed
    */
  ngDoCheck() {
    if (this.household != GlobalText.TEXTS) {
      this.household = GlobalText.TEXTS;
    }
  }

  /**
  * Get list of all project and put it in the project selector
  */
  getProjects() {
    this._projectService.get().subscribe(response => {
      let responseProject = Project.formatArray(response.json());
      responseProject.forEach(element => {
        var concat = element.id + " - " + element.name;
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
      let responseAdm1 = Location.formatAdm(response.json());
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
    let body = {};
    body['adm1'] = adm1;
    this._locationService.getAdm2(body).subscribe(response => {
      let responseAdm2 = Location.formatAdm(response.json());
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
    let body = {};
    body['adm2'] = adm2;
    this._locationService.getAdm3(body).subscribe(response => {
      let responseAdm3 = Location.formatAdm(response.json());
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
    let body = {};
    body['adm3'] = adm3;
    this._locationService.getAdm4(body).subscribe(response => {
      let responseAdm4 = Location.formatAdm(response.json());
      responseAdm4.forEach(element => {
        this.villageList.push(element);
      });
    });
  }

  /**
   * Get list of all Vulnerabilities
   */
  getVulnerabilityCriteria() {
    let promise = this._criteriaService.getVulnerabilityCriteria();
    if (promise) {
      promise.toPromise().then(response => {
        let responseCriteria = VulnerabilityCriteria.formatArray(response.json());
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
    let promise = this._countrySpecificsService.get();
    if (promise) {
      promise.toPromise().then(response => {
        let responseCountrySpecifics = CountrySpecific.formatArray(response.json());
        responseCountrySpecifics.forEach(element => {
          this.countrySpecifics.push(element);
        });
      });
    }

  }

  selected(event, type: string) {
    switch (type) {
      case 'province':
        let province = event.value.split(" - ");
        this.selectedProvince = province[1];
        this.getDistrict(province[0]);
        break;
      case 'district':
        let district = event.value.split(" - ");
        this.selectedDistrict = district[1];
        this.getCommune(district[0]);
        break;
      case 'commune':
        let commune = event.value.split(" - ");
        this.selectedCommune = commune[1];
        this.getVillage(commune[0]);
        break;
      case 'village':
        let village = event.value.split(" - ");
        this.selectedVillage = village[1];
        break;
      case 'project':
        let project = event.value.split(" - ");
        this.selectedProject = project[0];
        break;
      // case 'gender':
      //   this.selectedGender = event.value;
      //   break;
      // case 'typeNationalId':
      //   this.selectedtypeNationalId = event.value;
      //   break;
      // case 'typePhone':
      //   this.selectedtypePhone = event.value;
      //   break;
    }
  }

  getIdCountrySpecific(name: string) {
    let idCountrySpecific;
    this.countrySpecifics.forEach(element => {
      if (element.field === name)
        idCountrySpecific = element.id;
    })

    return idCountrySpecific;
  }

  /**
   * use to check vulnerabilites in member
   * @param vulnerablity 
   */
  choiceVulnerabilities(vulnerablity: VulnerabilityCriteria, index) {
    console.log('beneficiary index', index);
    let vulnerabilityFound = false;
    if (this.selectedVulnerabilities.length === 0) {
      this.selectedVulnerabilities.push(vulnerablity.id);
    } else {
      this.selectedVulnerabilities.forEach(element => {
        if (element === vulnerablity.id) {
          this.selectedVulnerabilities.splice(this.selectedVulnerabilities.indexOf(vulnerablity.id), 1);
          vulnerabilityFound = true;
        }
      })

      if (!vulnerabilityFound) {
        this.selectedVulnerabilities.push(vulnerablity.id);
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
      this.householdToCreate.livelihood = livelihood;
      this.answerCountrySpecific._results.forEach(result => {
        let answerCountry = new CountrySpecificAnswer;
        let idCountrySpecific = new CountrySpecific;
        answerCountry.answer = result.nativeElement.value;
        idCountrySpecific.id = this.getIdCountrySpecific(result.nativeElement.attributes[5].nodeValue);
        answerCountry.country_specific = idCountrySpecific;
        this.householdToCreate['country_specific_answers'].push(answerCountry);
      })
      this.stepper.next();
    } else {
      this.snackBar.open('Invalid field', '', { duration: 3000, horizontalPosition: "right" });
    }
  }

  next(type) {
    this.formatBeneficiaries(this.beneficiaryForm.value.beneficiary, type);
    console.log('new household', this.householdToCreate);
    this.stepper.next();
    // this.selectedVulnerability = this.beneficiary.vulnerabilities
  }

  formatBeneficiaries(beneficiaries, type) {
    beneficiaries.forEach(beneficiary => {
      let newBeneficiary: AddBeneficiaries = new AddBeneficiaries;
      console.log(newBeneficiary);
      newBeneficiary.family_name = beneficiary.familyName;
      newBeneficiary.given_name = beneficiary.givenName;
      let fieldPhone: Phones = new Phones;
      fieldPhone.number = beneficiary.phone;
      fieldPhone.type = beneficiary.typePhone;
      newBeneficiary.phones.push(fieldPhone);
      let fieldNationalID: NationalID = new NationalID;
      fieldNationalID.id_number = beneficiary.nationalID;
      fieldNationalID.id_type = beneficiary.typeNationalId;
      newBeneficiary.national_ids.push(fieldNationalID);
      if (beneficiary.gender === "F") {
        newBeneficiary.gender = 0
      }
      else {
        newBeneficiary.gender = 1
      }
      if (type === 'head') {
       newBeneficiary.status = "1";
      } else {
        newBeneficiary.status = "0";
      }
      let formatDateOfBirth = beneficiary.birth.toLocaleDateString().split('/');
      newBeneficiary.date_of_birth = formatDateOfBirth[2] + "-" + formatDateOfBirth[0] + "-" + formatDateOfBirth[1];
      this.householdToCreate.beneficiaries.push(newBeneficiary);
    })
  }


  // /**
  //  * Get and put in the householdToCreate Object all data associationg with members (head and beneficiaries)
  //  * @param familyName 
  //  * @param givenName 
  //  * @param dateOfBirth 
  //  * @param nationalID 
  //  * @param phone 
  //  * @param type 
  //  * @param livelihood 
  //  */
  // nextStep2(familyName: string, givenName: string, dateOfBirth, nationalID: string, phone: string, type: string) {
  //   let member = {};
  //   let fieldNationalID = {};
  //   let fieldPhones = {};
  //   let fieldVunerabilityCriteria = {};

  //   member['given_name'] = givenName;
  //   member['family_name'] = familyName;
  //   if (this.selectedGender === "F") {
  //     member['gender'] = 0;
  //   }
  //   else {
  //     member['gender'] = 1;
  //   }
  //   let formatDateOfBirth = dateOfBirth.split('/');
  //   member['date_of_birth'] = formatDateOfBirth[2] + "-" + formatDateOfBirth[0] + "-" + formatDateOfBirth[1];
  //   member['updated_on'] = new Date();
  //   member['profile'] = {};
  //   member['profile']['photo'] = "";
  //   member['national_ids'] = [];
  //   member['phones'] = [];
  //   member['vulnerability_criteria'] = [];

  //   this.selectedVulnerabilities.forEach(vulnerability => {
  //     fieldVunerabilityCriteria = {};
  //     fieldVunerabilityCriteria['id'] = vulnerability;
  //     member['vulnerability_criteria'].push(fieldVunerabilityCriteria);
  //   });

  //   if (phone != null) {
  //     if (this.selectedtypePhone != '') {
  //       fieldPhones['type'] = this.selectedtypePhone;
  //       fieldPhones['number'] = phone;
  //     }
  //     else {
  //       fieldPhones['type'] = 'type1';
  //       fieldPhones['number'] = phone;
  //     }
  //   } else {
  //     fieldPhones['type'] = null;
  //     fieldPhones['number'] = null;
  //   }
  //   member['phones'].push(fieldPhones);


  //   if (nationalID != null) {
  //     if (this.selectedtypeNationalId != '') {
  //       fieldNationalID['id_type'] = this.selectedtypeNationalId;
  //       fieldNationalID['id_number'] = nationalID;
  //     }
  //     else {
  //       fieldNationalID['id_type'] = 'card';
  //       fieldNationalID['id_number'] = nationalID;
  //     }
  //   } else {
  //     fieldNationalID['id_type'] = null;
  //     fieldNationalID['id_number'] = null;
  //   }
  //   member['national_ids'].push(fieldNationalID);

  //   if (type === 'head') {
  //     member['status'] = 1;
  //   } else {
  //     member['status'] = 0;
  //   }

  //   this.householdToCreate['beneficiaries'].push(member);
  //   this.stepper.next();

  // }

  cancel() {
    this.router.navigate(['/households']);
  }

  create() {
    let promise = this._householdsServce.add(this.householdToCreate, this.selectedProject);
    if (promise) {
      promise.toPromise().then(() => {
        this.router.navigate(['/households']);
      })
    }
  }

}