import { Component, OnInit, Input } from '@angular/core';
import { TableComponent } from '../table.component';

@Component({
    selector: 'app-table-mobile-search',
    templateUrl: './table-mobile-search.component.html',
    styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TableMobileSearchComponent extends TableComponent implements OnInit {

    @Input() deletable;

    ngOnInit() {
        if (!this.deletable) {
            this.deletable = true;
        }
    }

    print(element: any) {
        this.service.print(element);
    }

}
