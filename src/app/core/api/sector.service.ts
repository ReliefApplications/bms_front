import { Injectable                                 } from '@angular/core';

import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class SectorService extends CustomModelService {

    customModelPath = 'sectors';

    constructor(protected http: HttpService) {
        super(http);
    }
}
