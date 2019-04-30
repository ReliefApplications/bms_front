import { Component, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { Distribution } from 'src/app/model/distribution.new';
import { LanguageService } from 'src/texts/language.service';
import { DistributionService } from '../../core/api/distribution.service';
import { GeneralService } from '../../core/api/general.service';
import { LeafletService } from '../../core/external/leaflet.service';
import { Language } from './../../../texts/language';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    distributionData: MatTableDataSource<Distribution>;
    public nameComponent = 'dashboard_title';
    public actualCountry: string;

    distributionClass = Distribution;
    public userData;
    // Loaders
    loadingTable = true;
    loadingSummary = true;
    loadingMap = true;

    public maxWidthMobile = 750;
    public heightScreen;
    public widthScreen;

    public deletable = false;
    public editable = false;

    public summary = [];

    // Language
    public language: Language = this.languageService.selectedLanguage ?
        this.languageService.selectedLanguage : this.languageService.english;


    constructor(
        private serviceMap: LeafletService,
        private _cacheService: AsyncacheService,
        public _distributionService: DistributionService,
        public _generalService: GeneralService,
        public modalService: ModalService,
        private userService: UserService,
        private languageService: LanguageService,
    ) { }

    ngOnInit() {
        this._cacheService.getUser().subscribe(result => {
            if (result.get('loggedIn')) {
                this.serviceMap.createMap('map');

                this.getSummary();
                this.checkDistributions();
                this.checkSize();
            }
        });
        this.deletable = this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT');
        this.editable = this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT');
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
        this.loadingTable = true;
        this._distributionService.get()
            .subscribe(
                response => {
                    this.distributionData = new MatTableDataSource();

                    const instances = [];
                    if (response || response === []) {
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
