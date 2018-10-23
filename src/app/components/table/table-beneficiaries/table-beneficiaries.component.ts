import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { TableComponent } from '../table.component';
import { Beneficiaries } from '../../../model/beneficiary';
import { emit } from 'cluster';
import { element } from 'protractor';
import { tap } from 'rxjs/operators';


@Component({
    selector: 'app-table-beneficiaries',
    templateUrl: './table-beneficiaries.component.html',
    styleUrls: ['./table-beneficiaries.component.scss']
})
export class TableBeneficiariesComponent extends TableComponent {

    @Output() updating = new EventEmitter<number>();
    @Output() selected = new EventEmitter<number[]>();

    selectedList;

    ngOnInit() {
        super.checkData();
        this.sendSortedData();
    }

    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => {
            let filter;
            if (this.data.filter != '')
                filter = this.data.filter;

            if (this.sort.direction != 'asc' && this.sort.direction != 'desc')
                this.sort.active = ''

            this.paginator.pageIndex = 0;
            this.data.loadHouseholds(
                {
                    filter: filter,
                    filtered: 'vulnerabilities'
                },
                {
                    sort: this.sort.active,
                    direction: this.sort.direction
                },
                this.paginator.pageIndex,
                this.paginator.pageSize,
            );

        });
        this.paginator.page
            .pipe(
                tap(() => this.loadHouseholdsPage())
            )
            .subscribe();
    }

    loadHouseholdsPage() {
        let filter;
        if (this.data.filter != '')
            filter = this.data.filter;

        this.data.loadHouseholds(
            {
                filter: filter,
                filtered: 'vulnerabilities'
            },
            {
                sort: this.sort.active,
                direction: this.sort.direction
            },
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    getImageName(t2: String) {
        return (t2.substring(25).split('.')[0]);
    }

    update(selectedBeneficiary: Beneficiaries) {

        this.updating.emit(selectedBeneficiary.id);
    }

    sendSelectedBeneficiaries(benefId: any) {
        this.selectedList.push(benefId);
        //
    }

    sendSortedData() {
        this.selectedList = new Array();

        if (this.data && this.data.filter || this.data.filter == '') {
            //if (!isNaN(this.data.filter) && this.data.filtered == "vulnerabilities")
            //return snack;

            this.paginator.pageIndex = 0;
            this.data.loadHouseholds(
                {
                    filter: this.data.filter,
                    filtered: 'vulnerabilities'
                },
                {
                    sort: this.sort.active,
                    direction: this.sort.direction
                },
                this.paginator.pageIndex,
                this.paginator.pageSize,
            );
            // this.data.filter.forEach(
            //     element => {
            //         this.selectedList.push(element.id);
            //     }
            // )
        }

        this.selected.emit(this.selectedList);
    }
}
