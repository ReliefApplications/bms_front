import { Component, OnInit, Input, ViewChild               } from '@angular/core';
import { MatSort, MatTableDataSource, Sort                 } from '@angular/material';

import { MapperBms                                         } from '../../core/utils/mapper-bms.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;

  @Input() entity;
  @Input() data: any = [];
  sortedData: any;
  properties: any;
  propertiesTypes: any;
  propertiesActions: any;
  entityInstance = null;
  
  constructor(
    public mapperService: MapperBms,
  ) {

  }

  ngOnInit() {
    this.data.sort = this.sort;
    this.sortedData = this.data.slice();
    if(this.entity){
      this.entityInstance = this.mapperService.instantiate(this.entity);
      this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
      this.propertiesTypes = this.entityInstance.getTypeProperties(this.entityInstance);
      this.propertiesActions = Object.create(this.properties);
      this.propertiesActions.push("actions");
      this.mapperService.setMapperObject(this.entity);
    }
  }

  sortData(sort: Sort) {
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

  compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}