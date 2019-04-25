import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user';
import { TableComponent } from '../table.component';


@Component({
    selector: 'app-table-search',
    templateUrl: './table-search.component.html',
    styleUrls: ['../table.component.scss'],
})
export class TableSearchComponent extends TableComponent implements OnInit {


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

    print(element: any) {
        this.service.print(element);
    }

    getLocationName(element) {
        if (element.location && element.location.adm4) {
            return element.location.adm4;
        } else if (element.location && element.location.adm3) {
            return element.location.adm3;
        } else if (element.location && element.location.adm2) {
            return element.location.adm2;
        } else if (element.location && element.location.adm1) {
            return element.location.adm1;
        } else {
            return null;
        }
    }
}
