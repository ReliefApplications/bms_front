import { Component, OnInit, ViewChild } from '@angular/core';

import { TableComponent } from '../table.component';


@Component({
  selector: 'app-table-distribution',
  templateUrl: './table-distribution.component.html',
  styleUrls: ['../table.component.scss'],
})
export class TableDistributionComponent extends TableComponent {

  getImageName(t2: String) {
    return (t2.substring(26).split('.')[0]);
  }

}
