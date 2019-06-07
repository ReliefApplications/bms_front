import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Country } from 'src/app/models/country';


@Injectable({
    providedIn: 'root'
})
export class CountriesService {
//
// ─── VARIABLES ──────────────────────────────────────────────────────────────────
//
    public khm = new Country('KHM', 'Cambodia');
    public syr = new Country('SYR', 'Syria');

    public readonly enabledCountries: Array<Country> = [this.khm, this.syr];

    public selectableCountries: BehaviorSubject<Array<Country>> = new BehaviorSubject([]);

    public selectedCountry:  BehaviorSubject<Country> = new BehaviorSubject(undefined);

    public fillWithAllExistingCountries() {
        this.selectableCountries.next(this.enabledCountries);
    }

    public fillWithCountries(countries: Array<Country>) {
        this.selectableCountries.next(this.enabledCountries.filter((storedCountry: Country) => {
            return countries.filter((userCountry: Country) => {
                if (storedCountry.get<string>('id') === userCountry.get<string>('id')) {
                    return storedCountry;
                }
            })[0];
        }));
    }
//
// ─── SETTER ─────────────────────────────────────────────────────────────────────
//
    public setCountry(country?: Country): Country {
        if (!country) {
            country = this.enabledCountries[0];
        }
        if (this.selectedCountry.value !== country) {
            this.selectedCountry.next(country);
        }
        return country;
    }

//
// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
//
    public clearCountries(): void {
        this.selectedCountry.next(undefined);
    }

//
// ─── CONVERSION ─────────────────────────────────────────────────────────────────
//
    public stringToCountry(country: string): Country {
        switch (country) {
            case 'KHM':
                return this.khm;
            case 'SYR':
                return this.syr;
        }
    }

    public countryToString(country: Country): string {
        switch (country) {
            case this.khm:
                return 'KHM';
            case this.syr:
                return 'SYR';
        }
    }
}

