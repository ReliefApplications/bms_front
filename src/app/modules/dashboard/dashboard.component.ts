import { Component, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { GlobalText } from '../../../texts/global';
import { DistributionService } from '../../core/api/distribution.service';
import { GeneralService } from '../../core/api/general.service';
import { LeafletService } from '../../core/external/leaflet.service';
import { DistributionData } from '../../model/distribution-data';
import { Distribution } from 'src/app/model/distribution.new';
import { ModalService } from 'src/app/core/utils/modal.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    distributionData: Array<Distribution>;




    public dashboard = GlobalText.TEXTS;
    public nameComponent = 'dashboard_title';
    public actualCountry: string;

    distributionClass = Distribution;
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

    hasRights = false;
    hasRightsEdit = false;

    constructor(
        private serviceMap: LeafletService,
        private _cacheService: AsyncacheService,
        public _distributionService: DistributionService,
        public _generalService: GeneralService,
        public modalService: ModalService,
    ) { }

    ngOnInit() {
        this._cacheService.getUser().subscribe(result => {
            if (result.loggedIn) {
                this.serviceMap.createMap('map');
                this.serviceMap.addTileLayer();

                this.getSummary();
                this.checkDistributions();
                this.checkSize();
                this.checkPermission(result);
            }
        });
    }

    /**
     * check if the langage has changed
     */
    // ngDoCheck() {
    //     if (this.dashboard !== GlobalText.TEXTS) {
    //         this.dashboard = GlobalText.TEXTS;
    //     }

    //     if (LeafletService.loading !== this.loadingMap) {
    //         this.loadingMap = LeafletService.loading;
    //     }
    // }

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
        this.loadingTable = true;
        this._distributionService.get()
            .subscribe(
                response => {
                    this.distributionData = null;

                    const instances = [];
                    if (response || response === []) {
                        for (const item of response ) {
                            instances.push(Distribution.apiToModel(item));
                        }
                        this.distributionData = instances;
                        this.loadingTable = false;
                    } else {
                        this.loadingTable = false;
                    }
                },
                error => {
                    this.distributionData = null;
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

    checkPermission(result) {
        this.userData = result;

        if (result && result.rights) {
            const rights = result.rights;
            if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER') {
                this.hasRights = true;
            }

            if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_PROJECT_OFFICER') {
                this.hasRightsEdit = true;
            }
        }
    }

    openDialog(dialogDetails: any): void {

        this.modalService.openDialog(Distribution, this._distributionService, dialogDetails);
        this.modalService.isCompleted.subscribe(() => {
            this.checkDistributions();
        });
    }
}
