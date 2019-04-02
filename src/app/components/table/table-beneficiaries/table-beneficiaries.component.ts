import { Component, Output, EventEmitter, Input, OnInit, DoCheck, AfterViewInit, ViewChild } from '@angular/core';
import { TableComponent } from '../table.component';
import { Beneficiaries } from '../../../model/beneficiary';
import { emit } from 'cluster';
import { element } from 'protractor';
import { tap, finalize } from 'rxjs/operators';
import { DistributionData } from '../../../model/distribution-data';
import { GlobalText } from '../../../../texts/global';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
    selector: 'app-table-beneficiaries',
    templateUrl: './table-beneficiaries.component.html',
    styleUrls: ['../table.component.scss', './table-beneficiaries.component.scss'],
})
export class TableBeneficiariesComponent extends TableComponent implements OnInit, DoCheck, AfterViewInit {

    @Output() updating = new EventEmitter<number>();
    @Output() selectedAdm = new EventEmitter<any>();

    public texts = GlobalText.TEXTS;

    selectedFilter;
    keyWords = '';
    vulnerability: any = '';
    project: any = '';
    testLoading = true;
    beneficiary = GlobalText.TEXTS;
    advancedResearch = false;
    _timeout: any = null;
    mapperObject = null;
    public newObject: any;

    ngOnInit() {
        super.checkData();
        this.sendSortedData();
        this.selectedFilter = this.displayProperties[0];
        this.newObject = { adm1: null, adm2: null, adm3: null, adm4: null };
        this.mapperObject = this.mapperService.findMapperObject(DistributionData);
    }

    ngDoCheck() {
        const interval = window.setInterval(() => {
            if (this.data.loading === false) {
                this.testLoading = false;
                window.clearInterval(interval);
            }
        }, 1);
    }

    ngAfterViewInit() {
        if (this.sort) {
            this.sort.sortChange
                .subscribe(() => {
                    if (this.sort.direction !== 'asc' && this.sort.direction !== 'desc') {
                        this.sort.active = '';
                    }

                    this.testLoading = true;

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

    // getImageName(t2: String) {
    //     return (t2.substring(25).split('.')[0]);
    // }

    update(selectedBeneficiary: Beneficiaries) {
        this.updating.emit(selectedBeneficiary.id);
    }

    sendSortedData() {
        // Cancel preexisting timout process
        if (this._timeout) {
            window.clearTimeout(this._timeout);
        }
        this._timeout = window.setTimeout(() => {
            if (this.data.filter && (this.data.filter.filter || (this.data.filter.filter === ''))) {
                if (this.paginator) {
                    this.testLoading = true;
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
                return (result);
            }
        );
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
        while (this.data.filter.length !== 0) {
            this.project = '';
            this.vulnerability = '';
            this.keyWords = '';
            this.applyFilter('', 'vulnerabilities');
            this.applyFilter('', 'familyName');
            this.applyFilter('', 'projects');
            this.newObject = { adm1: null, adm2: null, adm3: null, adm4: null };
            this.sendSortedData();
        }
    }
}
