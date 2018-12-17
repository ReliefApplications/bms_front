import { Component, OnChanges, DoCheck } from '@angular/core';
import { TableComponent } from '../table.component';
import { GlobalText } from 'src/texts/global';

const RECENT_DIST_LENGTH = 5;

@Component({
  selector: 'app-table-dashboard',
  templateUrl: './table-dashboard.component.html',
  styleUrls: ['../table.component.scss'],
})
export class TableDashboardComponent extends TableComponent implements DoCheck {

  ngDoCheck() {
    if (this.data) {
      if (this.data.data && this.data.data.length > RECENT_DIST_LENGTH) {
        this.data.data = this.data.data.slice(-RECENT_DIST_LENGTH);
      }

      if (this.data.data) {
        if (this.entity !== this.oldEntity) {
          this.checkData();
        }
        if (!this.data.paginator) {
          this.data.paginator = this.paginator;
        }
        if (this.table !== GlobalText.TEXTS) {
          this.table = GlobalText.TEXTS;
          this.setDataTableProperties();
          this.mapperService.setMapperObject(this.entity);
        }
      }
    }
  }

  getImageName(t2: String) {
    return (t2.substring(26).split('.')[0]);
  }

}
