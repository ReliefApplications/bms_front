import { Component, OnInit, HostListener                                  } from '@angular/core';
import { MatDialog, MatTableDataSource                                    } from '@angular/material';
import { Router, ActivatedRoute                                                           } from '@angular/router';

import { GlobalText                                                       } from '../../../../texts/global';

import { Mapper                                                           } from '../../../core/utils/mapper.service';
import { CriteriaService                                                  } from '../../../core/api/criteria.service';

import { Commodity                                                        } from '../../../model/commodity';
import { Criteria                                                         } from '../../../model/criteria';
import { DistributionData                                                 } from '../../../model/distribution-data';

import { ModalAddLineComponent                                            } from '../../../components/modals/modal-add/modal-add-line/modal-add-line.component';
import { ModalAddComponent                                                } from '../../../components/modals/modal-add/modal-add.component';

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

  step = "";

  constructor(
    public mapper: Mapper,
    public dialog: MatDialog,
    private router: Router,
    private criteriaService: CriteriaService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.newObject = Object.create(this.entity.prototype);
    this.newObject.constructor.apply(this.newObject);
    this.mapperObject = this.mapper.findMapperObject(this.entity);
    this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
    this.propertiesTypes = this.newObject.getTypeProperties(this.newObject);
    this.checkSize();
    this.getQueryParameter();
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

  add() {
    this.addDistribution = true;
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
    if(value){
      this.commodityNb += value;
    }
  }

  removeCommodities(removeElement: Object) {
    let value = parseInt(removeElement["value"], 10);
    if(value){
      this.commodityNb -= value;
    }
  }
}
