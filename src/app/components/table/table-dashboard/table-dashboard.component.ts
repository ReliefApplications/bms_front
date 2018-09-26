import { Component, OnChanges, DoCheck } from '@angular/core';
import { TableComponent } from '../table.component';

const RECENT_DIST_LENGTH = 5;

@Component({
  selector: 'app-table-dashboard',
  templateUrl: './table-dashboard.component.html',
  styleUrls: ['./table-dashboard.component.scss']
})
export class TableDashboardComponent extends TableComponent implements DoCheck {

  ngDoCheck() {
    if (this.data.data.length > RECENT_DIST_LENGTH) {
        this.data.data = this.data.data.slice(-RECENT_DIST_LENGTH);
    }
  }

}
