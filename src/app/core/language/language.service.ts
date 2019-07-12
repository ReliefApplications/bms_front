import { Injectable } from '@angular/core';
import { Country } from 'src/app/models/country';
import { Language } from './language';
import { Arabic } from './translations/language-arabic';
import { English } from './translations/language-english';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
//
// ─── VARIABLES ──────────────────────────────────────────────────────────────────
//
    public english = new English();
    public arabic = new Arabic();

    public readonly enabledLanguages: Array<Language> = [this.english, this.arabic];

    // This default value's reference is not contained in enabledLanguages.
    private _selectedLanguage: Language = undefined;
    get selectedLanguage() {
        return this._selectedLanguage;
    }
    set selectedLanguage(language: Language) {
        this._selectedLanguage = language;
    }
//
// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
//
    public clearLanguage(): Language {
        this.selectedLanguage = undefined;
        return this.selectedLanguage;
    }

    public setLanguage(language: Language): Language {
        this.selectedLanguage = language;
        this.setMargins();
        return language;
    }
//
// ─── TYPE CONVERSION ────────────────────────────────────────────────────────────
//
    // TODO: do not use language as string anymore
    public stringToLanguage(language: string): Language {
        switch (language) {
            case 'ar':
                return this.arabic;
            case 'en':
                return this.english;
            case 'fr':
                return null;
        }
    }

    public languageToString(language: Language): string {
        switch (language) {
            case this.arabic:
                return 'ar';
            case this.english:
                return 'en';
            case null:
                return 'fr';
        }
    }
//
// ─── MISC ───────────────────────────────────────────────────────────────────────
//
    public countryToDefaultLanguage(country: Country): Language {
        switch (country.get<string>('id')) {
            case 'SYR':
                return this.arabic;
            case 'KHM':
            default:
                return this.english;
        }
    }

    public setMargins() {
        const element = document.getElementsByTagName('mat-sidenav-content') as HTMLCollectionOf<HTMLElement>;
        if (this.selectedLanguage === this.arabic) {
            document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
            element[0].style.margin = '0px 64px 0px 0px';
        } else {
            document.getElementsByTagName('html')[0].setAttribute('dir', '');
            element[0].style.margin = '0px 0px 0px 64px';
        }
    }


}
