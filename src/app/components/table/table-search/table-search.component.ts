import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { TableComponent } from '../table.component';
import { User } from 'src/app/model/user';

@Component({
    selector: 'app-table-search',
    templateUrl: './table-search.component.html',
    styleUrls: ['../table.component.scss'],
})
export class TableSearchComponent extends TableComponent implements OnInit {

    @Input() deletable;

    ngOnInit() {
        if (!this.deletable) {
            this.deletable = true;
        }
    }

    getImageName(t2: String) {
        if (t2) {
            return (t2.substring(25).split('.')[0]);
        }
    }

    entityIsUser() {
        const ok = this.entity === User;
        return ok;
    }

    requestLogs(element: any) {
        this.service.requestLogs(element.id).toPromise()
            .then(
                () => { this.snackbar.success('Logs have been sent'); }
            )
            .catch(
                (e) => {
                    this.snackbar.error('Logs could not be sent');
                }
            );
    }
}
