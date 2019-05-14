import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { Language } from 'src/app/core/language/language';
import { LanguageService } from 'src/app/core/language/language.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Country } from 'src/app/models/country';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { ModalLanguageComponent } from './../../modals/modal-language/modal-language.component';

export interface Breadcrumb {
    name: string;
    route: string;
}

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: [ './header.component.scss' ]
})
export class HeaderComponent implements OnInit, OnDestroy {

    // Screen size
    private screenSizeSubscription: Subscription;
    public currentDisplayType: DisplayType;

    // Language
    public language: Language = this.languageService.selectedLanguage ?
        this.languageService.selectedLanguage : this.languageService.english;

    // Countries
    public selectedCountry: Country;
    public countries: Array<Country>;
    private subscriptions: Array<Subscription>;

    // Breadcrumbs
    public breadcrumbs: Array<Breadcrumb>;

    // Tooltip
    public tooltip: string;

    constructor(
        private dialog: MatDialog,
        public languageService: LanguageService,
        private asynCacheService: AsyncacheService,
        private countriesService: CountriesService,
        private router: Router,
        private screenSizeService: ScreenSizeService,
    ) {

    }

    ngOnInit(): void {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.updateBreadcrumbs(event.url);
                this.updateTooltip(event.url);
            }
        });

        this.subscriptions = [
            this.languageService.languageSubject.subscribe((language: Language) => {
                this.language = language;
            }),
            this.countriesService.selectedCountry.subscribe((country: Country) => {
                this.selectedCountry = country;
            }),
            this.countriesService.selectableCountries.subscribe((countries: Array<Country>) => {
                this.countries = countries;
            }),
            this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
                this.currentDisplayType = displayType;
            }),
        ];
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    //
    // ─── COUNTRIES MANAGEMENT ───────────────────────────────────────────────────────
    //

    public selectCountry(country: Country): void {
        this.asynCacheService.setCountry(country).subscribe((_: any) => {
            window.location.reload();
        });
    }

    //
    // ─── LANGUAGE ───────────────────────────────────────────────────────────────────
    //

    openLanguageDialog() {
        this.dialog.open(ModalLanguageComponent, {});
    }

    //
    // ─── BREADCRUMBS ────────────────────────────────────────────────────────────────
    //

    /**
     * Update the breadcrumb according to the current route
     */
    updateBreadcrumbs(url: string) {
        url = url.split('?')[0];
        const parsedRoute = url.split('/');

        this.breadcrumbs = [{
            route: '/',
            name: this.language.home
        }];

        parsedRoute.forEach((item, index) => {
            if (index > 0 && item !== '') {
                if (isNaN(+item)) {
                    const breadcrumbItem = {
                        route: this.breadcrumbs[index - 1].route + (index === 1 ? '' : '/') + item,
                        name: this.language['header_' + item]
                    };
                    this.breadcrumbs.push(breadcrumbItem);
                } else {
                    const length = this.breadcrumbs.length;
                    this.breadcrumbs[length - 1].route = this.breadcrumbs[length - 1].route + '/' + item;
                }
            }
        });
    }

    //
    // ─── TOOLTIP ────────────────────────────────────────────────────────────────
    //

    /**
     * Update the tooltip according to the current route
     */
    updateTooltip(url: string) {
        const currentRoute = url.split('?')[0].split('/');

        // Get the current page, by the last element of the route that isn't a number
        let page = currentRoute.pop();
        if (page !== '' && +page === NaN) {
            page = currentRoute.pop();
        }

        this.tooltip = (page === '') ? this.language['tooltip_dashboard'] : this.language['tooltip_' + page.replace('-', '_')];
    }
}
