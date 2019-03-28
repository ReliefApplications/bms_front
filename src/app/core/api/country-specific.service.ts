import { Injectable } from '@angular/core';
import { CountrySpecific } from '../../model/country-specific.new';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';



@Injectable({
    providedIn: 'root'
})
export class CountrySpecificService extends CustomModelService {

    customModelPath = 'country_specifics';


    constructor(protected http: HttpService) {
        super(http);
    }

    fillWithOptions(countrySpecific: CountrySpecific) {
        // Do nothing as the types are not fetched from backend
    }
}
