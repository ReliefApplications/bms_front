import { Component, OnInit, ViewChild                         } from '@angular/core';

import { TableComponent                                       } from '../table.component';

@Component({
  selector: 'app-table-mobile-distribution',
  templateUrl: './table-mobile-distribution.component.html',
  styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TableMobileDistributionComponent extends TableComponent {

  getImageName(t2: String) {
    return (t2.substring(26).split('.')[0]);
  }
  
}