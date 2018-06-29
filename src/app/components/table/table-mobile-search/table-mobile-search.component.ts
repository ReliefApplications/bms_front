import { Component, OnInit                          } from '@angular/core';
import { TableComponent                             } from '../table.component';

@Component({
  selector: 'app-table-mobile-search',
  templateUrl: './table-mobile-search.component.html',
  styleUrls: ['./table-mobile-search.component.scss']
})
export class TableMobileSearchComponent extends TableComponent {

  isInDataRender(element: any):boolean{
    let idx = this.data._renderData._value.findIndex(elem => {
      return elem.id === element.id
    })
    if (idx !== -1){
      return true;
    }
    return false;

  }
}
