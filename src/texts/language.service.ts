import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Arabic } from './global_ar';
import { English } from './global_en';
import { Language } from './language';

const DEFAULT_LANGUAGE = English;


@Injectable({
    providedIn: 'root',
})
export class LanguageService {


    private english = new English();
    private arabic = new Arabic();

    public readonly enabledLanguages = [this.english, this.arabic];

    public languageSource = new BehaviorSubject<Language>(new DEFAULT_LANGUAGE());

    private selectedLanguage: Language;

    public changeLanguage(language: Language) {
        this.selectedLanguage = language;
        this.languageSource.next(this.selectedLanguage);
    }
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

    public selectCountryLanguage (country: string) {
        switch (country) {
            case 'SYR':
                this.changeLanguage(this.arabic);
            break;
            case 'KHM':
            default:
                this.changeLanguage(this.english);
            break;
        }
    }
}
