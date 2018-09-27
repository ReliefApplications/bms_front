import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';
import { URL_BMS_API                                } from '../../../environments/environment';
import { HttpService                                } from './http.service';
import { ExportService                              } from './export.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private exportService: ExportService
    ) {
    }

    public export(extensionType: string, category: string, country?: string) {
        if (category === 'projects' && country) {
            return this.exportService.export(category, country, extensionType);
        } else {
            return this.exportService.export(category, true, extensionType);
        }
    }
}
