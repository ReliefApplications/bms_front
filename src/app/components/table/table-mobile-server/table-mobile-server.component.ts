import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { TableServerComponent } from '../table-server/table-server.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CustomDataSource } from 'src/app/models/data-sources/custom-data-source.interface';

export interface Filter {
    category: string;
    filter: any;
}

@Component({
    selector: 'app-table-mobile-server',
    templateUrl: './table-mobile-server.component.html',
    styleUrls: ['../table-mobile/table-mobile.component.scss', './table-mobile-server.component.scss']
})
export class TableMobileServerComponent extends TableServerComponent {

  public tableServerData: CustomDataSource<any>;
  public filtersForAPI: Array<Filter> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  disabledActions: boolean;

  @Input() selection: any;

  ngOnInit() {
    this.tableServerData.loadData();
  }


  loadDataMobilePage() {
      this.tableServerData.loadData(
          this.filtersForAPI,
          {
              sort: (this.sort && this.sort.active) ? this.sort.active : null,
              direction: (this.sort && this.sort.direction !== '') ? this.sort.direction : null
          },
          this.paginator.pageIndex,
          this.paginator.pageSize);
          this.manageActions();
  }

  manageActions() {
      if (this.selection.selected.length > 0) {
          this.disabledActions = true;
      } else {
          this.disabledActions = false;
      }
  }
}
