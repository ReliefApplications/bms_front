import { Injectable  } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';
import { HttpService } from './http.service';
import { saveAs      } from 'file-saver/FileSaver';
import { MatSnackBar } from '@angular/material';

@Injectable({
	providedIn: 'root'
})
export class ExportService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private snackBar: MatSnackBar
    ) {
    }

    /**
     * Export data
     * @param  key           key to define data to export (e.g. distributions)
     * @param  value         value to define data to export (e.g. projet_id)
     * @param  extensionType extension of the file
     * @return               file to export
     */
    public export(key: string, value: any, extensionType: string) {
        let params = {};
        params['type'] = extensionType;
        params[key] = value;
        const options = {
            responseType: "blob",
            params: params
        };
        const url = this.api + '/export';
        return this.http.get(url, options).toPromise()
        .then(response => {
            saveAs(response, key + '.' + extensionType);
        });
    }
}
