import { Component, OnInit, Input               } from '@angular/core';
import { Mapper                                 } from '../../core/utils/mapper.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input() entity;
  @Input() data: any = [];
  properties: any;
  propertiesActions: any;
  entityInstance = null;
  
  constructor(
    public mapperService: Mapper,
  ) {

  }

  ngOnInit() {
    if(this.entity){
      this.entityInstance = this.mapperService.instantiate(this.entity);
      this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
      this.propertiesActions = Object.create(this.properties);
      this.propertiesActions.push("actions");
      this.mapperService.setMapperObject(this.entity);
    }
  }

}