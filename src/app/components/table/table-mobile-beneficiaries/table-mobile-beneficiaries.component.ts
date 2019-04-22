import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Beneficiaries } from '../../../model/beneficiary';
import { TableBeneficiariesComponent } from '../table-beneficiaries/table-beneficiaries.component';

@Component({
    selector: 'app-table-mobile-beneficiaries',
    templateUrl: './table-mobile-beneficiaries.component.html',
    styleUrls: ['../table-mobile/table-mobile.component.scss', './table-mobile-beneficiaries.component.scss']
})
export class TableMobileBeneficiariesComponent extends TableBeneficiariesComponent implements AfterViewInit {

    @Output() updating = new EventEmitter<number>();
    @Output() selectedAdm = new EventEmitter<any>();

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
            if (this.data.filter && ( this.data.filter.filter || this.data.filter.filter === '') ) {
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

    update(selectedBeneficiary: Beneficiaries) {
        this.updating.emit(selectedBeneficiary.id);
    }

    selected(index) {
        if (index === 'adm1') {
            if (this.newObject.adm1 == null) {
                return;
            }
        } else if (index === 'adm2') {
            if (this.newObject.adm2 == null) {
                return;
            }
        } else if (index === 'adm3') {
            if (this.newObject.adm3 == null) {
                return;
            }
        } else if (index === 'adm4') {
            if (this.newObject.adm4 == null) {
                return;
            }
        }

        this.selectedAdm.emit({ index: index, object: this.newObject });
    }

    showAdvancedResearch() {
        this.advancedResearch = !this.advancedResearch;
    }

    clearSearch() {
        while ( this.data.filter.length !== 0 ) {
            this.project = '';
            this.vulnerability = '';
            this.keyWords = '';
            // this.applyFilter('', 'vulnerabilities') ;
            // this.applyFilter('', 'familyName');
            // this.applyFilter('', 'projects');
            this.newObject = { adm1: null, adm2: null, adm3: null, adm4: null };
            this.sendSortedData();
        }
    }
}
