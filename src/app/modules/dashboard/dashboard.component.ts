import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { MapService } from 'src/app/core/external/map.service';
import { Language } from 'src/app/core/language/language';
import { LanguageService } from 'src/app/core/language/language.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { Distribution } from 'src/app/models/distribution';
import { DistributionService } from '../../core/api/distribution.service';
import { GeneralService } from '../../core/api/general.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

    distributionData: MatTableDataSource<Distribution>;
    public nameComponent = 'dashboard_title';
    public actualCountry: string;

    distributionClass = Distribution;
    public userData;
    // Loaders
    loadingTable = true;
    loadingSummary = true;
    loadingMap = true;

    public deletable = false;
    public editable = false;

    public summary = [];

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language: Language = this.languageService.selectedLanguage ?
        this.languageService.selectedLanguage : this.languageService.english;


    constructor(
        private mapService: MapService,
        private _cacheService: AsyncacheService,
        public _distributionService: DistributionService,
        public _generalService: GeneralService,
        public modalService: ModalService,
        private userService: UserService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
    ) { }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
        this._cacheService.getUser().subscribe(result => {
            if (result) {
                this.getSummary();
                this.checkDistributions();
            }
        });
        this.deletable = this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT');
        this.editable = this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT');
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
        this.mapService.removeMap();
    }
    ngAfterViewInit(): void {
        this.mapService.createMap('map');
        this.loadingMap = false;
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
                    this.distributionData = new MatTableDataSource();

                    const instances = [];
                    if (response) {
                        for (const item of response ) {
                            instances.push(Distribution.apiToModel(item));
                        }
                        this.distributionData = new MatTableDataSource(instances);
                        this.loadingTable = false;
                    } else {
                        this.loadingTable = false;
                    }
                },
                error => {
                    this.distributionData = new MatTableDataSource();
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

    openDialog(dialogDetails: any): void {

        this.modalService.openDialog(Distribution, this._distributionService, dialogDetails);
        this.modalService.isCompleted.subscribe(() => {
            this.checkDistributions();
        });
    }
}
