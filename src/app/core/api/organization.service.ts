import { Injectable } from '@angular/core';
import { LanguageService } from 'src/app/core/language/language.service';
import { Donor } from '../../models/donor';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';
import { ExportService } from './export.service';
import { Organization } from 'src/app/models/organization';



@Injectable({
    providedIn: 'root'
})
export class OrganizationService extends CustomModelService {

    customModelPath = 'organization';

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
        public exportService: ExportService,
    ) {
        super(http, languageService);
    }

    print(event: Organization) {
        return this.exportService.printOrganizationTemplate();
    }


    public fillWithOptions (donor: Donor) {

    }
}
