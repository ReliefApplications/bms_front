import { Component, Input         } from '@angular/core';


@Component({
  selector   : 'data-table',
  templateUrl: './data-table.component.html',
  styleUrls  : ['./data-table.component.scss']
})


export class DataTableComponent {

  @Input() dataTable: any;
  @Input() typeChartTable: string;
  @Input() dataAxis: any;

  public data: any;

  constructor( ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.typeChartTable && this.dataTable && this.dataTable.length > 0) {
      switch(this.typeChartTable) {
        default:
        case 'bar': {
          this.data = this.dataTable;
          break;
        }
        case 'line': {
          //TODO: temporary, define how the indicator's data are formatted in the API
          this.data = this.dataTable[0].series;
          break;
        }
      }
    }
  }
}
