import { Component, OnInit, ViewChild                         } from '@angular/core';

import { TableComponent                                       } from '../table.component';

@Component({
  selector: 'app-table-search',
  templateUrl: './table-search.component.html',  
  styleUrls: ['../table.component.scss'],
})
export class TableSearchComponent extends TableComponent {

    getImageName(t2: String) {
        return( t2.substring(25).split('.')[0] );
    }
}
