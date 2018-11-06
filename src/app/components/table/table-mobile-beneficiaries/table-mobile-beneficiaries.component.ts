import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { TableBeneficiariesComponent } from '../table-beneficiaries/table-beneficiaries.component';
import { Beneficiaries } from '../../../model/beneficiary';
import { emit } from 'cluster';
import { element } from 'protractor';
import { tap } from 'rxjs/operators';


@Component({
    selector: 'app-table-mobile-beneficiaries',
    templateUrl: './table-mobile-beneficiaries.component.html',
    styleUrls: ['../table-mobile/table-mobile.component.scss']
})
export class TableMobileBeneficiariesComponent extends TableBeneficiariesComponent {

    ngAfterViewInit() {
        this.paginator.page
            .pipe(
                tap(() => this.loadHouseholdsPage())
            )
            .subscribe();
    }

    loadHouseholdsPage() {
        this.data.loadHouseholds(
            this.data.filter,
            {},
            this.paginator.pageIndex,
            this.paginator.pageSize
        );
    }

    sendSortedData() {
        // Cancel preexisting timout process
        if (this._timeout) {
            window.clearTimeout(this._timeout);
        }
        this._timeout = window.setTimeout(() => {
            if (this.data.filter && ( this.data.filter.filter || this.data.filter.filter == '') ) {
              if (this.paginator) {
                this.paginator.pageIndex = 0;
                this.data.loadHouseholds(
                  this.data.filter,
                  {},
                  this.paginator.pageIndex,
                  this.paginator.pageSize,
                );
              }
            }
            this._timeout = null;
        }, 1000);
    }

    getForSelect(selection) {
        this.selected.emit(selection);
    }
}
