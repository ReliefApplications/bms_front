import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';
import { CustomModelService } from '../utils/custom-model.service';

@Injectable({
    providedIn: 'root'
})
export class LogsService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'logs';
}
