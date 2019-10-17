import { Injectable } from '@angular/core';
import { CountrySpecific } from '../../models/country-specific';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';
import { LanguageService } from '../language/language.service';



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
}
