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
  entityInstance = null;

  constructor(
    public mapperService: Mapper,
  ) {

  }

  /** on initialiase le composant admin-table
   * recuperer toutes les proprietes de la classe en cours d'utilisation
   * ainsi que les donnees de cette classe
   */
  ngOnInit() {
    if(this.entity){
      this.entityInstance = this.mapperService.instantiate(this.entity);
      this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapper(this.entityInstance));
      this.mapperService.setMapperObject(this.entity);
    }
  }

  
}