import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';

import { TableComponent } from '../table.component';

@Component({
  selector: 'app-table-search',
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.scss']
})
export class TableSearchComponent extends TableComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.sortedData.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.data= this.allData;
    if(!filterValue)
      return;
    let filterData = this.allData.slice();
    let index = -1;
    for (let data of this.allData) {
      if (!data.name.toLowerCase().includes(filterValue)) {
        index = filterData.indexOf(data);
        if (index !== -1)
          filterData.splice(index, 1);
        }
    }
    this.data = filterData.slice();
  }
}
