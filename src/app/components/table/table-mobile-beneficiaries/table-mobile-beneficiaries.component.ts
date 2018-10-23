import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { TableComponent } from '../table.component';
import { Beneficiaries } from '../../../model/beneficiary';
import { emit } from 'cluster';
import { element } from 'protractor';
import { tap } from 'rxjs/operators';


@Component({
    selector: 'app-table-mobile-beneficiaries',
    templateUrl: './table-mobile-beneficiaries.component.html',
    styleUrls: ['./table-mobile-beneficiaries.component.scss']
})
export class TableMobileBeneficiariesComponent extends TableComponent {

    @Output() updating = new EventEmitter<number>();

    selectedFilter;
    testLoading = true;

    ngOnInit() {
        super.checkData();
        this.data.loading$.subscribe(
            result => {
                if (result != this.testLoading) {
                    this.testLoading = result;
                }
            }
        );
        this.selectedFilter = this.properties[0];
    }

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
            {
            },
            this.paginator.pageIndex,
            this.paginator.pageSize
            );
    }

    getImageName(t2: String) {
        return (t2.substring(25).split('.')[0]);
    }

    update(selectedBeneficiary: Beneficiaries) {

        this.updating.emit(selectedBeneficiary.id);
    }

    sendSortedData() {

        if (this.data.filter && ( this.data.filter.filter || this.data.filter.filter == '') ) {
            //if (!isNaN(this.data.filter) && this.data.filtered == "vulnerabilities")
            //return snack;
            
            this.paginator.pageIndex = 0;
            this.data.loadHouseholds(
                this.data.filter,
                {},
                this.paginator.pageIndex,
                this.paginator.pageSize,
            );
            // this.data.filter.forEach(
            //     element => {
            //         this.selectedList.push(element.id);
            //     }
            // )
        }
    }

    dataIsLoading() {
        this.data.getLoadingState().subscribe(
            result => {
                return (result);
            }
        )
    }
}
