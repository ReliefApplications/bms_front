import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { TableComponent } from '../table.component';
import { Beneficiaries } from '../../../model/beneficiary';
import { emit } from 'cluster';
import { element } from 'protractor';
import { tap, finalize } from 'rxjs/operators';


@Component({
    selector: 'app-table-beneficiaries',
    templateUrl: './table-beneficiaries.component.html',
    styleUrls: ['../table.component.scss'],
})
export class TableBeneficiariesComponent extends TableComponent {

    @Output() updating = new EventEmitter<number>();

    selectedFilter;
    testLoading = true;
    _timeout: any = null;

    ngOnInit() {
        super.checkData();
        this.sendSortedData();
        this.data.loading$
        .pipe(
            finalize(
                () => {
                    this.testLoading = false;
                }
            )
        ).subscribe(
            result => {
                if(result != this.testLoading) {
                    this.testLoading = result;
                }
            }
        );
        this.selectedFilter= this.properties[0];
    }

    ngAfterViewInit() {
        if (this.sort) {
          this.sort.sortChange.subscribe(() => {
            if (this.sort.direction != 'asc' && this.sort.direction != 'desc')
            this.sort.active = ''

            this.paginator.pageIndex = 0;
            this.data.loadHouseholds(
              this.data.filter,
              {
                sort: this.sort.active,
                direction: this.sort.direction
              },
              this.paginator.pageIndex,
              this.paginator.pageSize,
            );

          });
        }

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
                sort: this.sort ? this.sort.active : null,
                direction: this.sort ? this.sort.direction : null
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
                  {
                    sort: this.sort ? this.sort.active : null,
                    direction: this.sort ? this.sort.direction : null
                  },
                  this.paginator.pageIndex,
                  this.paginator.pageSize,
                );
              }
            }
            this._timeout = null;
        }, 1000);
    }

    dataIsLoading() {
        this.data.getLoadingState().subscribe(
            result => {
                return(result);
            }
        )
    }

}
