import { Injectable } from '@angular/core';
import { Commodity, Modality, ModalityType } from 'src/app/model/commodity.new';
import { LanguageService } from 'src/texts/language.service';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';
import { ModalitiesService } from './modalities.service';

@Injectable({
    providedIn: 'root'
})
export class CommodityService extends CustomModelService {

    customModelPath = '';
    constructor(
        protected http: HttpService,
        private modalityService: ModalitiesService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    fillModalitiesOptions(commodity: Commodity) {
        this.modalityService.getModalities().subscribe(modalities => {
            commodity.setOptions('modality', modalities.map(modality => {
                return new Modality(modality.id, modality.name);
            }));
        });
    }

    fillTypeOptions(commodity: Commodity, modalityId) {
        this.modalityService.getModalitiesType(modalityId).subscribe(types => {
            commodity.setOptions('modalityType', types.map(modalityType => {
                return new ModalityType(modalityType.id, modalityType.name);
            }));
        });
    }
}

