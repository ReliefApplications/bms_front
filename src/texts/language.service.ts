import { Injectable } from '@angular/core';
import { Arabic } from './global_ar';
import { English } from './global_en';
import { Language } from './language';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {


    private english = new English();
    private arabic = new Arabic();

    public readonly enabledLanguages: Array<Language> = [this.english, this.arabic];

    public selectedLanguage: Language = this.english;
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
}
