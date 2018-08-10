import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { GlobalText } from '../../../../texts/global';

import { Mapper } from '../../../core/utils/mapper.service';
import { CriteriaService } from '../../../core/api/criteria.service';

import { Commodity } from '../../../model/commodity';
import { Criteria } from '../../../model/criteria';
import { DistributionData } from '../../../model/distribution-data';

import { ModalAddLineComponent } from '../../../components/modals/modal-add/modal-add-line/modal-add-line.component';
import { ModalAddComponent } from '../../../components/modals/modal-add/modal-add.component';
import { FormControl } from '@angular/forms';
import { LocationService } from '../../../core/api/location.service';
import { Project } from '../../../model/project';
import { CacheService } from '../../../core/storage/cache.service';

@Component({
  selector: 'app-add-distribution',
  templateUrl: './add-distribution.component.html',
  styleUrls: ['./add-distribution.component.scss']
})
export class AddDistributionComponent implements OnInit {
  public nameComponent = "add_distribution_title";
  public distribution = GlobalText.TEXTS;
  public newObject: any;
  mapperObject = null;
  public properties: any;
  public propertiesTypes: any;
  entity = DistributionData;

  public criteriaClass = Criteria;
  public criteriaAction = "addCriteria";
  public criteriaArray = [];
  public criteriaData = new MatTableDataSource([]);
  public criteriaNbBeneficiaries = 0;

  public commodityClass = Commodity;
  public commodityAction = "addCommodity";
  public commodityArray = [];
  public commodityData = new MatTableDataSource([]);
  public commodityNb = 0;

  public addDistribution = false;

  public maxHeight = GlobalText.maxHeight;
  public maxWidthMobile = GlobalText.maxWidthMobile;
  public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
  public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
  public maxWidth = GlobalText.maxWidth;
  public heightScreen;
  public widthScreen;

  public queryParams;
  public controls = new FormControl();

  public loadedData: any = [];

  step = "";

  constructor(
    public mapper: Mapper,
    public dialog: MatDialog,
    private router: Router,
    private criteriaService: CriteriaService,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private _cacheService: CacheService
  ) { }

  ngOnInit() {
    this.newObject = Object.create(this.entity.prototype);
    this.newObject.constructor.apply(this.newObject);
    this.mapperObject = this.mapper.findMapperObject(this.entity);
    console.log('mapper object', this.mapperObject)
    this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
    this.propertiesTypes = this.newObject.getTypeProperties(this.newObject);
    this.checkSize();
    this.getQueryParameter();
    console.log("add distribution", this.newObject)
    this.loadProvince();
    console.log('load Data', this.loadedData)
  }

  loadProvince() {
    this.locationService.getAdm1().subscribe(response => {
      this.loadedData.adm1 = response.json();
      this._cacheService.set(CacheService.ADM1, this.loadedData.adm1);

    });
    this.loadedData.adm2 = [];
    this.loadedData.adm3 = [];
    this.loadedData.adm4 = [];
  }

  loadDistrict(adm1) {
    this.locationService.getAdm2(adm1).subscribe(response => {
      this.loadedData.adm2 = response.json();
      this._cacheService.set(CacheService.ADM2, this.loadedData.adm2);

    });
    this.loadedData.adm3 = [];
    this.loadedData.adm4 = [];
  }

  loadCommunity(adm2) {
    this.locationService.getAdm3(adm2).subscribe(response => {
      this.loadedData.adm3 = response.json();
      this._cacheService.set(CacheService.ADM3, this.loadedData.adm3);

    });
    this.loadedData.adm4 = [];
  }

  loadVillage(adm3) {
    this.locationService.getAdm4(adm3).subscribe(response => {
      this.loadedData.adm4 = response.json();
      this._cacheService.set(CacheService.ADM4, this.loadedData.adm4);

    });
  }

  selected($event, selectedObject, index) {
    if (index === "adm1") {
      this.loadDistrict(selectedObject);
    } else if (index === "adm2") {
      this.loadCommunity(selectedObject);
    } else if (index === "adm3") {
      this.loadVillage(selectedObject);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void {
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  /**
   * get the parameter in the route
   * use to get the active project
   */
  getQueryParameter() {
    this.route.queryParams.subscribe(params => this.queryParams = params)
  }

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.distribution != GlobalText.TEXTS) {
      this.distribution = GlobalText.TEXTS;
      this.mapperObject = this.mapper.findMapperObject(this.entity);
      this.nameComponent = GlobalText.TEXTS.distribution_title;
      this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
    }
  }

  cancel() {
    this.router.navigate(["distribution"]);
  }

  getAdmName(adm: string) {
    if (adm === "adm1") {
      let adm1 = this._cacheService.get(CacheService.ADM1);
      for(let i=0; i<adm1.length; i++) {
        if (adm1[i].id === this.newObject.adm1) {
          return adm1[i].name;
        }
      }
    } else if (adm === "adm2") {
      let adm2 = this._cacheService.get(CacheService.ADM2);
      for(let i=0; i<adm2.length; i++) {
        if (adm2[i].id === this.newObject.adm2) {
          return adm2[i].name;
        }
      }
    }
    else if (adm === "adm3") {
      let adm3 = this._cacheService.get(CacheService.ADM3);
      for(let i=0; i<adm3.length; i++) {
        if (adm3[i].id === this.newObject.adm3) {
          return adm3[i].name;
        }
      }
    }
    else if (adm === "adm4") {
      let adm4 = this._cacheService.get(CacheService.ADM4);
      for(let i=0; i<adm4.length; i++) {
        if (adm4[i].id === this.newObject.adm4) {
          return adm4[i].name;
        }
      }
    }
  }

  add() {
    this.addDistribution = true;
    let newDistribution: DistributionData = new DistributionData;
    newDistribution.name = this.newObject.name;
    newDistribution.type = "0";
    newDistribution.project.id = this.queryParams.project;
    
    newDistribution.location.adm1 = this.getAdmName('adm1');
    newDistribution.location.adm2 = this.getAdmName('adm2');
    newDistribution.location.adm3 = this.getAdmName('adm3');
    newDistribution.location.adm4 = this.getAdmName('adm4');
    newDistribution.selection_criteria = this.criteriaArray;
    newDistribution.commodities = this.commodityArray;

    let formatDateOfBirth = this.newObject.date_distribution.toLocaleDateString().split('/');
    if (formatDateOfBirth[0].length < 2) {
      formatDateOfBirth[0] = "0" + formatDateOfBirth[0];
    }
    if (formatDateOfBirth[1].length < 2) {
      formatDateOfBirth[1] = "0" + formatDateOfBirth[1];
    }

    newDistribution.date_distribution = formatDateOfBirth[2] + "-" + formatDateOfBirth[0] + "-" + formatDateOfBirth[1];



    console.log(this.newObject)
    console.log('criteria', this.criteriaArray);
    console.log('commodity', this.commodityArray)

    console.log("neew distribution", newDistribution)

  }

  setStep(index: string) {
    this.step = index;
  }

  /**
  * open each modal dialog
  */
  openDialog(user_action): void {
    let dialogRef;

    if (user_action == this.criteriaAction) {
      dialogRef = this.dialog.open(ModalAddLineComponent, {
        data: { data: [], entity: this.criteriaClass, mapper: this.mapper }
      });
    } else if (user_action == this.commodityAction) {
      dialogRef = this.dialog.open(ModalAddComponent, {
        data: { data: [], entity: this.commodityClass, mapper: this.mapper }
      });
    }
    if (dialogRef) {
      const create = dialogRef.componentInstance.onCreate.subscribe((data) => {
        this.createElement(data, user_action);
      });

      dialogRef.afterClosed().subscribe(result => {
        create.unsubscribe();
        console.log('The dialog was closed');
      });
    }
  }

  createElement(createElement: Object, user_action) {
    if (user_action == this.criteriaAction) {
      this.criteriaArray.push(createElement);
      this.criteriaService.getBeneficiariesNumber(this.criteriaArray, this.queryParams.project).subscribe(response => {
        this.criteriaNbBeneficiaries = response.json();
      });
      this.criteriaData = new MatTableDataSource(this.criteriaArray);
    } else if (user_action == this.commodityAction) {
      this.commodityArray.push(createElement);
      this.sumCommodities(createElement);
      this.commodityData = new MatTableDataSource(this.commodityArray);
    }
  }

  removeElement(removeElement: Object, user_action) {
    if (user_action == this.criteriaAction) {
      const index = this.criteriaArray.findIndex((item) => item === removeElement);
      if (index > -1) {
        this.criteriaArray.splice(index, 1);
        this.criteriaData = new MatTableDataSource(this.criteriaArray);
      }
    } else if (user_action == this.commodityAction) {
      const index = this.commodityArray.findIndex((item) => item === removeElement);
      if (index > -1) {
        this.commodityArray.splice(index, 1);
        this.criteriaService.getBeneficiariesNumber(this.criteriaArray, this.queryParams.project).subscribe(response => {
          this.criteriaNbBeneficiaries = response.json();
        });
        this.removeCommodities(removeElement);
        this.commodityData = new MatTableDataSource(this.commodityArray);
      }
    }
  }

  sumCommodities(createElement: Object) {
    let value = parseInt(createElement["value"], 10);
    if (value) {
      this.commodityNb += value;
    }
  }

  removeCommodities(removeElement: Object) {
    let value = parseInt(removeElement["value"], 10);
    if (value) {
      this.commodityNb -= value;
    }
  }
}
