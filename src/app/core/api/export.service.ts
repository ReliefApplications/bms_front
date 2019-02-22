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
    public export(key: string, value: any, extensionType: string, body = null) {
        const params = {};
        params['type'] = extensionType;
        params[key] = value;
        const options = {
            responseType: 'blob',
            params: params
        };
        const url = this.api + '/export';
        return this.http.post(url, body, options).toPromise()
        .then(response => {
            saveAs(response, key + '.' + extensionType);
        });
    }

    public printVoucher(id: number) {
        return this.http.get(this.api + '/booklets/print/' + id, {responseType: 'blob'}).toPromise()
        .then(response => {
            var blob = new Blob([response], {type: ('blob')});
            var filename = 'Booklet1.pdf';
            saveAs(blob, filename);
        });
    }

    public printAll() {
        let body = {
            bookletIds: [1, 2, 3]
        };
        return this.http.post(this.api + '/booklets-print', body, {responseType: 'blob'}).toPromise()
        .then(response => {
            var blob = new Blob([response], {type: ('blob')});
            var filename = 'AllVouchers.pdf';
            saveAs(blob, filename);
        });
    }
}
