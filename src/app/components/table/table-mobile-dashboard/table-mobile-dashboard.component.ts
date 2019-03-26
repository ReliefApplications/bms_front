import { Component } from '@angular/core';
import { TableDashboardComponent } from '../table-dashboard/table-dashboard.component';

const RECENT_DIST_LENGTH = 5;

@Component({
    selector: 'app-table-mobile-dashboard',
    templateUrl: './table-mobile-dashboard.component.html',
    styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TableMobileDashboardComponent extends TableDashboardComponent {

    getImageName(t2: String) {
        return (t2.substring(26).split('.')[0]);
    }
}
