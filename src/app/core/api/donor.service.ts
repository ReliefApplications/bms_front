import { Injectable } from '@angular/core';
import { LanguageService } from 'src/texts/language.service';
import { Donor } from '../../model/donor';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';



@Injectable({
    providedIn: 'root'
})
export class DonorService extends CustomModelService {

    customModelPath = 'donors';

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }


    public fillWithOptions (donor: Donor) {

    }
}
