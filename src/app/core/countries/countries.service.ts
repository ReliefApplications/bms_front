import { Injectable } from '@angular/core';
import { Country } from 'src/app/model/country';


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

    public selectableCountries: Array<Country>;

    public currentCountry: Country;



    public fillWithAllExistingCountries() {
        this.selectableCountries = this.enabledCountries;
    }

    public fillWithCountries(countries: Array<Country>) {
        this.selectableCountries = this.enabledCountries.filter((storedCountry: Country) => {
            return countries.forEach((userCountry: Country) => {
                if (storedCountry.get<string>('id') === userCountry.get<string>('id')) {
                    return storedCountry;
                }
            });
        });
    }


//
// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
//
    public clearCountries(): Country {
        this.currentCountry = undefined;
        return this.currentCountry;
    }
}

