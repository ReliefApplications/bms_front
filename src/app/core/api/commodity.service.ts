import { Injectable                                 } from '@angular/core';
import { HttpService                                } from './http.service';
import { CustomModelService } from './custom-model.service';
import { ModalitiesService } from './modalities.service';
import { Commodity } from 'src/app/model/commodity.new';

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
            commodity.fields.modality.options = modalities.map(modality => {
                return { fields : {
                    name: { value: modality.name },
                    id: { value: modality.id }
                }};
            });
        });
    }

    fillTypeOptions(commodity: Commodity, modalityId) {
        this.modalityService.getModalitiesType(modalityId).subscribe(types => {
            commodity.fields.modalityType.options = types.map(modality => {
                return { fields : {
                    name: { value: modality.name },
                    id: { value: modality.id }
                }};
            });
        });
    }
}

