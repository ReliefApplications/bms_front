import { Component, DoCheck, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { GlobalText } from '../../../texts/global';
import { DistributionService } from '../../core/api/distribution.service';
import { GeneralService } from '../../core/api/general.service';
import { LeafletService } from '../../core/external/leaflet.service';
import { DistributionData } from '../../model/distribution-data';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, DoCheck {
    public dashboard = GlobalText.TEXTS;
    public nameComponent = 'dashboard_title';
    public actualCountry: string;

    referedClassToken = DistributionData;
    distributions: MatTableDataSource<DistributionData>;
    public userData;
    // Loaders
    loadingTable = true;
    loadingSummary = true;
    loadingMap = true;

    public maxWidthMobile = 750;
    public heightScreen;
    public widthScreen;

    public summary = [];

    constructor(
        private serviceMap: LeafletService,
        private _cacheService: AsyncacheService,
        public _distributionService: DistributionService,
        public _generalService: GeneralService,

    ) { }

    ngOnInit() {
        this._cacheService.getUser().subscribe(result => {
            if (result.loggedIn) {
                this.serviceMap.createMap('map');

                this.getSummary();
                this.checkDistributions();
                this.checkSize();
            }
        });
    }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.dashboard !== GlobalText.TEXTS) {
            this.dashboard = GlobalText.TEXTS;
        }

        if (LeafletService.loading !== this.loadingMap) {
            this.loadingMap = LeafletService.loading;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    /**
    * get the distributions list to display on dashboard
    * check if it is cached, otherwise get it from the api
    */

    checkDistributions(): void {
        let distribs;
        this.loadingTable = true;
        this._distributionService.get()
            .subscribe(
                response => {
                    if (response) {
                        distribs = new MatTableDataSource(this.referedClassToken.formatArray(response));
                        this.distributions = distribs;
                        this.loadingTable = false;
                    }
                },
                error => {
                    this.distributions = null;
                    this.loadingTable = false;
                }
            );
    }

    /**
     * Get summary information
     * @return array
     */
    getSummary(): void {
        this.loadingSummary = true;
        this._generalService.getSummary()
            .pipe(
                finalize(
                    () => {
                        this.loadingSummary = false;
                    },
                )
            ).subscribe(
                response => {
                    if (response) {
                        this.loadingSummary = false;
                        this.summary = response;
                    }
                },
                error => {
                    this.loadingSummary = false;
                    this.summary = null;
                }
            );
    }
}
