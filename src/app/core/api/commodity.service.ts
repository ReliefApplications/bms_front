import { Injectable                                 } from '@angular/core';
import { HttpService                                } from './http.service';
import { CustomModelService } from './custom-model.service';

@Injectable({
    providedIn: 'root'
})
export class CommodityService extends CustomModelService {

    customModelPath = '';
    constructor(
        protected http: HttpService
    ) {
        super(http);
    }
}

