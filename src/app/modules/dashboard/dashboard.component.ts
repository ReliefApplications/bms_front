import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { URL_BMS_API } from '../../../environments/environment';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { LeafletService } from '../../core/external/leaflet.service';
import { DistributionService } from '../../core/api/distribution.service';
import { GeneralService } from '../../core/api/general.service';

import { DistributionData } from '../../model/distribution-data';

import { GlobalText } from '../../../texts/global';
import { finalize } from 'rxjs/operators';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    public dashboard = GlobalText.TEXTS;
    public nameComponent = 'dashboard_title';
    
    referedClassToken = DistributionData;
    distributions: MatTableDataSource<DistributionData>;
    public userData;
    // Loaders
    loadingTable = true;
    loadingSummary = true;

    public maxWidthMobile = 750;
    public heightScreen;
    public widthScreen;
    private static firstLog = true;

    public summary = [];

    hasRights: boolean = false;
    hasRightsEdit: boolean = false;

    constructor(
        private serviceMap: LeafletService,
        private _cacheService: AsyncacheService,
        public _distributionService: DistributionService,
        public _generalService: GeneralService,

    ) { }

    ngOnInit() {
        if(!DashboardComponent.firstLog) {
            this.serviceMap.createMap('map');
            this.serviceMap.addTileLayer();

            this.getSummary();
            this.checkDistributions();
            this.checkSize();
        }
        this.checkPermission();
    }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.dashboard !== GlobalText.TEXTS) {
            this.dashboard = GlobalText.TEXTS;
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
        this._distributionService.get()
            .pipe(
                finalize(
                    () => {
                        this.loadingTable = false;
                    },
                )
            ).subscribe(
                response => {
                    distribs = new MatTableDataSource(this.referedClassToken.formatArray(response));
                    //console.log(distribs);
                    this.distributions = distribs;
                    this.loadingTable = false;
                });
    }

    /**
     * Get summary information
     * @return array
     */
    getSummary(): void {
        this._generalService.getSummary()
            .pipe(
                finalize(
                    () => {
                        this.loadingSummary = false;
                    },
                )
            ).subscribe(response => {
                if(response) {
                    this.loadingSummary = false;
                    this.summary = response;
                } 
            });
    }

    checkPermission() {
        this._cacheService.getUser().subscribe(
            result => {
                this.userData = result;
                //console.log(result)

                if (result && result.voters) {
                    const voters = result.voters;
                    if(DashboardComponent.firstLog === true) {
                        DashboardComponent.firstLog = false;
                        this.ngOnInit();
                    }
                    if (voters == "ROLE_ADMIN" || voters == 'ROLE_PROJECT_MANAGER')
                        this.hasRights = true;

                    if (voters == "ROLE_ADMIN" || voters == 'ROLE_PROJECT_MANAGER' || voters == "ROLE_PROJECT_OFFICER")
                        this.hasRightsEdit = true;
                }
            }
        );
    }

}
