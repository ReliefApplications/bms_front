import { Component, OnChanges, DoCheck } from '@angular/core';
import { TableComponent } from '../table.component';

const RECENT_DIST_LENGTH = 5;

@Component({
  selector: 'app-table-mobile-dashboard',
  templateUrl: './table-mobile-dashboard.component.html',
  styleUrls: ['./table-mobile-dashboard.component.scss']
})
export class TableMobileDashboardComponent extends TableComponent implements DoCheck {

  ngDoCheck() {
    if (this.data.data.length > RECENT_DIST_LENGTH) {
        this.data.data = this.data.data.slice(-RECENT_DIST_LENGTH);
    }
  }

}
