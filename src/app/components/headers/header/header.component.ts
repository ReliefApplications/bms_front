import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Event, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Country } from 'src/app/model/country';
import { LanguageService } from 'src/texts/language.service';
import { ModalLanguageComponent } from './../../modals/modal-language/modal-language.component';



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
    public breadcrumbs: Array<string>;

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
            console.log(event);
            if (event instanceof NavigationStart) {
                this.updateBreadCrumbs(event.url);
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
        this.updateBreadCrumbs(this.router.url);
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
    updateBreadCrumbs(url: string) {
        this.breadcrumbs = url.split('/');
        console.log(this.breadcrumbs);
    }



}
