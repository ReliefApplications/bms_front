
import { Component, OnInit, Input, ViewChild               } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, Sort} from '@angular/material';

import { Mapper                                            } from '../../core/utils/mapper.service';

import { ModalDetailsComponent                  } from '../modals/modal-details/modal-details.component';
import { ModalComponent                         } from '../modals/modal.component';
import { ModalUpdateComponent                   } from '../modals/modal-update/modal-update.component';
import { ModalDeleteComponent                   } from '../modals/modal-delete/modal-delete.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;

  @Input() entity;
  @Input() data: any = [];
  @Input() service;
  sortedData: any;
  properties: any;
  propertiesTypes: any;
  propertiesActions: any;
  entityInstance = null;
  public user_action: string = '';

  constructor(
    public mapperService: Mapper,
    public dialog: MatDialog
  ) {

  }

  ngOnInit() {
    if(!this.data)
      this.data = [];
      
    this.data.sort = this.sort;
    this.sortedData = this.data.slice();
    console.log(this.properties);    
    if(this.entity){
      this.entityInstance = this.mapperService.instantiate(this.entity);
      this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
      this.propertiesTypes = this.entityInstance.getTypeProperties(this.entityInstance);
      this.propertiesActions = Object.create(this.properties);
      this.propertiesActions.push("actions");
      this.mapperService.setMapperObject(this.entity);
      console.log(this.properties);
    }
  }

  /**
  * sort data displayed by the table
  * sort.active represents the column to sort
  * sort.direction can be Asc or Desc
  */
  sortData(sort: Sort): void {
    const data = this.data.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      let isAsc = sort.direction == 'asc';
      return this.compare(this.entityInstance.getMapper(a)[sort.active], this.entityInstance.getMapper(b)[sort.active], isAsc);
    });
  }

  compare(a, b, isAsc): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  /**
  * open each modal dialog
  */
  openDialog(user_action, element): void {
    let dialogRef;

    if(user_action == 'details'){
      dialogRef = this.dialog.open(ModalDetailsComponent, {
        data: { data: element, entity: this.entity, service: this.service, mapper: this.mapperService}
      });
    }else if (user_action == 'update'){
      dialogRef = this.dialog.open(ModalUpdateComponent, {
        data: { data: element, entity: this.entity, service: this.service, mapper: this.mapperService}
      });
    } else {
      dialogRef = this.dialog.open(ModalDeleteComponent, {
        data: { data: element, entity: this.entity, service: this.service, mapper: this.mapperService}
      });
    }
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}