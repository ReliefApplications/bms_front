import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FormControl, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { Location } from '../../../model/location';
import { LocationService } from '../../../core/api/location.service';
import { MatInput, MatSnackBar, MatStepper } from '@angular/material';
import { CriteriaService } from '../../../core/api/criteria.service';
import { VulnerabilityCriteria } from '../../../model/vulnerability_criteria';

@Component({
  selector: 'add-household',
  templateUrl: './addHousehold.component.html',
  styleUrls: ['./addHousehold.component.scss']
})
export class AddHouseholdComponent implements OnInit {

  public nameComponent = "add_household_title";
  public household = GlobalText.TEXTS;

  @ViewChild('stepper') stepper: MatStepper;

  //for the project selector
  public projects = new FormControl('', Validators.required);
  public projectList: string[] = [];
  public selectedProject: string = null;

  //for the gender selector
  public gender = new FormControl();
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

  public allVulnerability = [];

  //for the address' input
  public addressNumber = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
  public addressStreet = new FormControl('', [Validators.pattern('[a-zA-Z ]*'), Validators.required]);
  public addressPostcode = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
  public occupation = new FormControl();
  public selectedVulnerabilities = [];

  public householdToCreate: any = {}

  constructor(
    public _projectService: ProjectService,
    public _locationService: LocationService,
    public snackBar: MatSnackBar,
    public _criteriaService: CriteriaService
  ) { }

  ngOnInit() {
    this.getProjects();
    this.getProvince();
    this.getVulnerabilityCriteria();
  }

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
    this._criteriaService.getVulnerabilityCriteria().subscribe(response => {
      let responseCriteria = VulnerabilityCriteria.formatArray(response.json());
      responseCriteria.forEach(element => {
        this.allVulnerability.push(element);
      });
    });
  }


  selected(event, type) {
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
      case 'gender':
        this.selectedGender = event.value;
        break;
    }
  }

  /**
   * use to check vulnerabilites in member
   * @param vulnerablity 
   */
  choiceVulnerabilities(vulnerablity) {
    let vulnerabilityFound = false;
    if (this.selectedVulnerabilities.length === 0) {
      this.selectedVulnerabilities.push(vulnerablity.id);
    } else {
      this.selectedVulnerabilities.forEach(element => {
        if(element === vulnerablity.id) {
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
  nextStep1(addressNumber: string, addressStreet: string, addressPostcode: string, notes: string) {
    if (!this.addressNumber.invalid && !this.addressStreet.invalid && !this.addressPostcode.invalid && !this.province.invalid && !this.projects.invalid) {
      this.householdToCreate['notes'] = notes;
      this.householdToCreate['latitude'] = '0';
      this.householdToCreate['longitude'] = '0';
      this.householdToCreate['address_number'] = addressNumber;
      this.householdToCreate['address_street'] = addressStreet;
      this.householdToCreate['address_postcode'] = addressPostcode;
      this.householdToCreate['location'] = {};
      this.householdToCreate['location']['country_iso3'] = 'KHM';
      this.householdToCreate['location']['adm1'] = this.selectedProvince;
      this.householdToCreate['location']['adm2'] = this.selectedDistrict;
      this.householdToCreate['location']['adm3'] = this.selectedCommune;
      this.householdToCreate['location']['adm4'] = this.selectedVillage;
      this.householdToCreate['beneficiaries'] = [];
      this.stepper.next();
    } else {
      this.snackBar.open('Invalid field', '', { duration: 3000, horizontalPosition: "right" });
    }
  }

  nextStep2(familyName: string, givenName: string, dateOfBirth, nationalID: string,  type: string,livelihood?: string) {
    let member = {};
    let fieldNationalID = {};
    let fieldPhones = {};
    let fieldVunerabilityCriteria = {};

    member['given_name'] = givenName;
    member['family_name'] = familyName;
    if (this.selectedGender === "F") {
      member['gender'] = 0;
    } 
    else {
      member['gender'] = 1;
    }
    let formatDateOfBirth = dateOfBirth.split('/');
    member['data_of_birth'] = formatDateOfBirth[2] + "-" + formatDateOfBirth[0] + "-" + formatDateOfBirth[1];
    member['updated_on'] = new Date();
    member['profile'] = {};

    member['national_ids'] = [];
    member['phones'] = [];
    member['vulnerability_criteria'] = [];

    this.selectedVulnerabilities.forEach(vulnerability => {
      fieldVunerabilityCriteria = {};
      fieldVunerabilityCriteria['id'] = vulnerability;
      member['vulnerability_criteria'].push(fieldVunerabilityCriteria);
    });

    fieldNationalID['id_number'] = nationalID;
    fieldNationalID['id_type'] = 'type1';
    member['national_ids'].push(fieldNationalID);
    
    fieldPhones['number'] = '555555',
    fieldPhones['type'] = 'type1',
    member['phones'].push(fieldPhones);

    
    if(type === 'head') {
      this.householdToCreate['livelihood'] = livelihood;
      member['status'] = 1;
    } else {
      member['status'] = 0;
    }

    
   
    
    this.householdToCreate['beneficiaries'].push(member);
    this.stepper.next();

    console.log(this.householdToCreate);
  }

  cancel() {

  }

  create() {
    console.log(this.selectedProject);
  }

}
