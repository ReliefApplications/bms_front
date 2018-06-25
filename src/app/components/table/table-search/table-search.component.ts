import { Component, OnInit, ViewChild                          } from '@angular/core';
import { MatTableDataSource, MatPaginator                      } from '@angular/material';

import { TableComponent                                        } from '../table.component';

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
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.sortedData.filter = filterValue;
  }
}
