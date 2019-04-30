import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Event, NavigationStart, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Country } from 'src/app/model/country';
import { LanguageService } from 'src/texts/language.service';
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


    // Language
    public language = this.languageService.selectedLanguage;

    // Countries
    public selectedCountry: Country;
    public countries: Array<Country>;
    private subscriptions: Array<Subscription>;

    // Breadcrumbs
    public breadcrumbs: Array<Breadcrumb>;

    constructor(
        private dialog: MatDialog,
        private languageService: LanguageService,
        private asynCacheService: AsyncacheService,
        private countriesService: CountriesService,
        private router: Router,
    ) {

    }
    ngOnInit(): void {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.updateBreadcrumbs(event.url);
            }
        });

        this.subscriptions = [
                this.countriesService.selectedCountry.subscribe((country: Country) => {
                    this.selectedCountry = country;
                }),
                this.countriesService.selectableCountries.subscribe((countries: Array<Country>) => {
                    this.countries = countries;
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
}
