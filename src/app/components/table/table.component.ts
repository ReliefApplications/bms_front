
import { Component, OnInit, Input, ViewChild               } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, Sort, MatTableDataSource, MatPaginator, PageEvent} from '@angular/material';

import { Mapper                                            } from '../../core/utils/mapper.service';

import { ModalDetailsComponent                  } from '../modals/modal-details/modal-details.component';
import { ModalComponent                         } from '../modals/modal.component';
import { ModalUpdateComponent                   } from '../modals/modal-update/modal-update.component';
import { ModalDeleteComponent                   } from '../modals/modal-delete/modal-delete.component';
import { CacheService                           } from '../../core/storage/cache.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() entity;
  public oldEntity;
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
    public dialog: MatDialog,
    public _cacheService: CacheService
  ) {}

  ngOnInit() {
    this.checkData();
  }

  ngDoCheck(){
    if(this.entity != this.oldEntity){
      this.checkData();
    }
  }
  
  updateData(){
    this.service.get().subscribe(response => {
      this.data = new MatTableDataSource(this.entity.formatArray(response.json()));
      //update cache associated variable
      this._cacheService.set((<typeof CacheService>this._cacheService.constructor)[this.entity.__classname__.toUpperCase() + "S"], response.json());

      this.setDataTableProperties();
    }, error => {
      console.log("error", error);
    });
  }

  setDataTableProperties(){
    this.data.sort = this.sort;
    this.data.paginator = this.paginator;
  }

  checkData(){
    if(!this.data){
      this.data = new MatTableDataSource([]);
    }
    this.setDataTableProperties();
    if(this.entity){
      this.entityInstance = this.mapperService.instantiate(this.entity);
      
      this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
      this.propertiesTypes = this.entityInstance.getTypeProperties(this.entityInstance);
      this.propertiesActions = new Array();
      this.properties.forEach(element => {
        this.propertiesActions.push(element);
      });
      this.propertiesActions.push("actions");
      this.mapperService.setMapperObject(this.entity);
    }    
    this.oldEntity = this.entity;
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
    let deleteElement = null;
    if(dialogRef.componentInstance.onDelete){
      deleteElement = dialogRef.componentInstance.onDelete.subscribe((data) => {
        this.deleteElement(data);
      });
    }
    let updateElement = null;
    if(dialogRef.componentInstance.onUpdate){
      updateElement = dialogRef.componentInstance.onUpdate.subscribe((data) => {
        this.updateElement(data);
      });
    }
    

    dialogRef.afterClosed().subscribe(result => {
      if(updateElement)
        updateElement.unsubscribe();
      if(deleteElement)
        deleteElement.unsubscribe();
      console.log('The dialog was closed');
    });
  }

  applyFilter(filterValue: string): void {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.data.filter = filterValue;
  }

  updateElement(updateElement: Object){
    updateElement = this.entity.formatForApi(updateElement);
    this.service.update(updateElement['id'], updateElement).subscribe(response => {
      this.updateData();
    })
  } 

  deleteElement(deleteElement: Object){
    deleteElement = this.entity.formatForApi(deleteElement);
    this.service.delete(deleteElement['id'], deleteElement).subscribe(response => {
      this.updateData();
    })
  } 
}