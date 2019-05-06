import { Injectable } from '@angular/core';
import { LanguageService } from 'src/app/core/language/language.service';
import { CountrySpecific } from '../../model/country-specific';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';



@Injectable({
    providedIn: 'root'
})
export class CountrySpecificService extends CustomModelService {

    customModelPath = 'country_specifics';


    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    fillWithOptions(countrySpecific: CountrySpecific) {
        // Do nothing as the types are not fetched from backend
    }
}
