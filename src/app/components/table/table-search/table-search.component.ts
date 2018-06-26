import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';

import { TableComponent } from '../table.component';

@Component({
  selector: 'app-table-search',
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.scss']
})
export class TableSearchComponent extends TableComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  initPageSize = 5;
  pageIndex = 0;

  //contrary to data which represents the data displayed for one page,
  //and contrary to allData  which represents all data without filters, 
  //allDataWithFilter represents all data with filters and is used for pagination index
  allDataWithFilter: any; 

  ngOnInit(){
    super.ngOnInit();
    this.allDataWithFilter = this.allData.slice();
    this.preparePage(this.initPageSize, this.pageIndex);
  }

  /**
  * apply a wanted page size and page index to the table pagination
  */
  preparePage(pageSize: number, pageIndex: number): void{
    let page = new PageEvent();
    page.pageSize = pageSize;
    page.pageIndex = pageIndex;
    this.applyPagination(page);
  }

  /**
  * apply filter on data and create allDataWithFilter for pagination
  * if the filter value is empty, the data and allDataWithFilter represents allData (initially get for a service)
  * if not, allDatawithFilter is set and a new pagination is applied
  */
  applyFilter(filterValue: string): void{
    this.data = this.allData;
    if(!filterValue){
      this.allDataWithFilter = this.data.slice();
      this.preparePage(this.initPageSize, 0);
      return;
    }
      
    let filterData = this.allData.slice();
    let index = -1;
    for (let data of this.allData) {
      if (!data.name.toLowerCase().includes(filterValue)) {
        index = filterData.indexOf(data);
        if (index !== -1)
          filterData.splice(index, 1);
        }
    }
    this.allDataWithFilter = filterData.slice();
    this.preparePage(this.initPageSize, 0);    
  }

  /**
  * called after a pageSize changed or a new pageIndex
  * update data to display on page
  */
  applyPagination(event?:PageEvent): PageEvent{
    let newData = [];
    let dataIndex = 0;
    this.pageIndex = event.pageIndex;
    for(let i = 0; i<event.pageSize; i++){
      dataIndex = i + event.pageIndex*event.pageSize;
      if(dataIndex < this.allDataWithFilter.length){
        newData.push(this.allDataWithFilter[dataIndex]);
      }
    }
    this.data = newData;
    return event;
  }
}
