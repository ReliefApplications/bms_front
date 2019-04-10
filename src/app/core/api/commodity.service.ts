import { Injectable                                 } from '@angular/core';
import { HttpService                                } from './http.service';
import { CustomModelService } from './custom-model.service';
import { ModalitiesService } from './modalities.service';
import { Commodity, ModalityType } from 'src/app/model/commodity.new';
import { Modality } from 'src/app/model/commodity.new';

@Injectable({
    providedIn: 'root'
})
export class CommodityService extends CustomModelService {

    customModelPath = '';
    constructor(
        protected http: HttpService, private modalityService: ModalitiesService
    ) {
        super(http);
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

