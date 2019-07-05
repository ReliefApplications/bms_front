import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { URL_BMS_API } from '../../../environments/environment';
import { HttpService } from '../network/http.service';

@Injectable({
    providedIn: 'root'
})
export class ExportService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private snackbar: SnackbarService
    ) {
    }

    /**
     * Export data
     * @param  key           key to define data to export (e.g. distributions)
     * @param  value         value to define data to export (e.g. projet_id)
     * @param  extensionType extension of the file
     * @param filters        the filters to apply to the data
     * @return               file to export
     */
    public export(key: string, value: any, extensionType: string, body = null, filters: any = null, ids: Array<string> = []) {

        const params = {};
        params['type'] = extensionType;
        params[key] = value;
        const options = {
            responseType: 'blob',
            params: params
        };
        const url = this.api + '/export';
        if (filters) {
            body['filters'] = filters;
        }
        if (ids && ids.length > 0) {
            body['ids'] = ids;
        }
        return this.http.post(url, body, options).toPromise()
        .then(response => {
            if (! response) {
                this.snackbar.warning('No data to export');
            }
            saveAs(response, key + '.' + extensionType);
        });
    }

    public printVoucher(id: number) {
        return this.http.get(this.api + '/booklets/print/' + id, {responseType: 'blob'}).toPromise()
        .then(response => {
            const blob = new Blob([response], {type: ('blob')});
            const filename = 'Booklet-' + id + '.pdf';
            saveAs(blob, filename);
        });
    }

    public async printManyVouchers(bookletIds: number[]) {
        const body = {
            bookletIds: bookletIds
        };
        return this.http.post(this.api + '/booklets-print', body, {responseType: 'blob'}).toPromise()
        .then(response => {
            const blob = new Blob([response], {type: ('blob')});
            const filename = 'Booklets.pdf';
            saveAs(blob, filename);
        });
    }

    public printInvoice(vendorId: number) {
        return this.http.get(this.api + '/invoice-print/' + vendorId, {responseType: 'blob'}).toPromise()
        .then(response => {
            const blob = new Blob([response], {type: ('blob')});
            const filename = 'Invoice-' + vendorId + '.pdf';
            saveAs(blob, filename);
        });
    }

    public printOrganizationTemplate() {
        return this.http.get(this.api + '/organization/print/template', {responseType: 'blob'}).toPromise()
        .then(response => {
            const blob = new Blob([response], {type: ('blob')});
            const filename = 'Pdf-template.pdf';
            saveAs(blob, filename);
        });
    }
}
