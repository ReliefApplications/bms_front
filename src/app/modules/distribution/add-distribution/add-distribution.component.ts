import { Component, OnInit                                              } from '@angular/core';
import { MatDialog, MatTableDataSource                                  } from '@angular/material';

import { GlobalText                                                     } from '../../../../texts/global';

import { Mapper                                                         } from '../../../core/utils/mapper.service';

import { Criteria                                                       } from '../../../model/criteria';
import { DistributionData                                               } from '../../../model/distribution-data';

import { ModalAddComponent                                              } from '../../../components/modals/modal-add/modal-add.component';

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

  public criteriaClassService;
  public criteriaClass = Criteria;
  public criteriaArray = [];
  public criteriaData = new MatTableDataSource([]);

  step = "";

  constructor(
    public mapper: Mapper,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.newObject = Object.create(this.entity.prototype);
    this.newObject.constructor.apply(this.newObject);
    this.mapperObject = this.mapper.findMapperObject(this.entity);
    this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
    this.propertiesTypes = this.newObject.getTypeProperties(this.newObject);
  }

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.distribution != GlobalText.TEXTS) {
      this.distribution = GlobalText.TEXTS;
      this.nameComponent = GlobalText.TEXTS.distribution_title;
      this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
    }
  }

  cancel() {

  }

  add() {

  }

  setStep(index: string) {
    this.step = index;
  }

  /**
  * open each modal dialog
  */
  openDialog(user_action): void {
    let dialogRef;

    if (user_action == 'addCriteria') {
      dialogRef = this.dialog.open(ModalAddComponent, {
        data: { data: [], entity: this.criteriaClass, service: this.criteriaClassService, mapper: this.mapper }
      });
    }
    const create = dialogRef.componentInstance.onCreate.subscribe((data) => {
      this.createElement(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      create.unsubscribe();
      console.log('The dialog was closed');
    });
  }

  createElement(createElement: Object) {
    this.criteriaArray.push(createElement);
    this.criteriaData = new MatTableDataSource(this.criteriaArray);
  }

  removeElement(removeElement: Object){
    const index = this.criteriaArray.findIndex((item) => item === removeElement);
    if (index > -1) {
      this.criteriaArray.splice(index, 1);
    }
  }
}
