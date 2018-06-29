
import { Component, OnInit, Input, ViewChild               } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, Sort, MatTableDataSource, MatPaginator, PageEvent} from '@angular/material';

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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() entity;
  @Input() data: any = [];
  @Input() service;
  sortedData: any;
  allData: any;
  properties: any;
  propertiesTypes: any;
  propertiesActions: any;
  entityInstance = null;
  public user_action: string = '';
  
   constructor(
    public mapperService: Mapper,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log(this.data);
    if(!this.data)
      this.data = new MatTableDataSource([]);
      this.data.sort = this.sort;
      this.data.paginator = this.paginator;
      if(this.entity){
        this.entityInstance = this.mapperService.instantiate(this.entity);
        this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
        this.propertiesTypes = this.entityInstance.getTypeProperties(this.entityInstance);
        this.propertiesActions = Object.create(this.properties);
        this.propertiesActions.push("actions");
        this.mapperService.setMapperObject(this.entity);
    }
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

  applyFilter(filterValue: string): void {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.data.filter = filterValue;
  }
}