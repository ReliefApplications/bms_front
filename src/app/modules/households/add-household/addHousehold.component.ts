import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FormControl } from '@angular/forms';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { Location } from '../../../model/location';
import { LocationService } from '../../../core/api/location.service';

@Component({
  selector: 'add-household',
  templateUrl: './addHousehold.component.html',
  styleUrls: ['./addHousehold.component.scss']
})
export class AddHouseholdComponent implements OnInit {

  public nameComponent = "add_household_title";
  public household = GlobalText.TEXTS;

  public referedClassService;

  //for the project selector
  public projects = new FormControl();
  public projectList: string[] = [];
  public selectedProject: string = null;

  //for the gender selector
  public gender = new FormControl();
  public genderList: string[] = ['F', 'M'];
  public selectedGender: string = null;

  //for the province selector
  public province = new FormControl();
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

  constructor(
    public _projectService: ProjectService,
    public _locationService: LocationService,
  ) { }

  ngOnInit() {
    this.getProjects();
    this.getProvince();
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
    this.referedClassService = this._projectService;
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
    this.referedClassService = this._projectService;
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
    let body = {};
    body['adm1'] = adm1;
    this.referedClassService = this._projectService;
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
    let body = {};
    body['adm2'] = adm2;
    this.referedClassService = this._projectService;
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
    let body = {};
    body['adm3'] = adm3;
    this.referedClassService = this._projectService;
    this._locationService.getAdm4(body).subscribe(response => {
      let responseAdm4 = Location.formatAdm(response.json());
      responseAdm4.forEach(element => {
        this.villageList.push(element);
      });
    });
  }


  selected(event, type) {
    switch (type) {
      case 'province':
        let province = event.value.split(" - ");
        this.selectedProvince = province[0];
        this.getDistrict(this.selectedProvince);
        break;
      case 'district':
        let district = event.value.split(" - ");
        this.selectedDistrict = district[0];
        this.getCommune(this.selectedDistrict);
        break;
      case 'commune':
        let commune = event.value.split(" - ");
        this.selectedCommune = commune[0];
        this.getVillage(this.selectedCommune);
        break;
      case 'village':
        let village = event.value.split(" - ");
        this.selectedVillage = village[0];
        break;
    }

  }

  cancel() {

  }

  create() {

  }

}
