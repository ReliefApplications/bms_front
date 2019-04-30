import { Component } from '@angular/core';
import { TableServerComponent } from '../table-server/table-server.component';

@Component({
    selector: 'app-table-mobile-server',
    templateUrl: './table-mobile-server.component.html',
    styleUrls: ['../table-mobile/table-mobile.component.scss', './table-mobile-server.component.scss']
})
export class TableMobileServerComponent extends TableServerComponent {

}
